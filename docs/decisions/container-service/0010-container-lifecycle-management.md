## ITD — Container Lifecycle Management for Container Execution Service

### Summary statement
Run each job in a fresh ephemeral container created from a pre-pulled language-specific base image. Apply strict isolation and automatic cleanup after execution. Avoid container pooling to eliminate state leakage, malware persistence, and environment drift risks.

### Context
The execution service runs untrusted code with strict security and reproducibility requirements.  
Container lifecycle decisions directly impact:
- **Security** — preventing cross-job contamination.
- **Consistency** — ensuring the same input produces the same output regardless of previous runs.
- **Performance** — minimizing startup latency.

An ideal approach would:
- Start each job in a known-clean environment.
- Guarantee complete cleanup after execution.
- Minimize startup delay through image caching.
- Be simple to maintain and audit.

### Problem to solve
Determine how to manage container creation, execution, and cleanup to maximize security and reproducibility while keeping latency low.

### Options

#### Option 1 — Fresh container per job (selected)
Create a new container for each job, run the code, then remove container and associated resources immediately.

#### Option 2 — Container pool
Keep warm containers for each language and inject code/testcases between runs.

#### Option 3 — Reuse container per user/session
Long-lived container tied to a user or session, running multiple jobs.

### Selected option
**Option 1 (Fresh container per job)**:
- Pre-pull and cache all language base images at runner startup.
- Use Docker’s `--rm` equivalent for automatic removal on normal exit.
- On timeout or abnormal termination:
  - Kill container.
  - Remove container and associated volumes.
  - Delete temporary host directories.
- Enforce:
  - `--network none` (disable networking).
  - `--read-only` root filesystem.
  - Limited writable mounts (`/tmp`).
  - Resource limits (memory, CPU, output size).
- Unique container names/IDs for log traceability.
- Idempotent cleanup — safe to call multiple times.

### Why not pooling?
Container pooling is avoided because:
1. **State leakage between jobs** — hidden files, caches, or language runtime artifacts could leak data between users.
2. **Malware persistence** — an attacker could plant a payload in a pooled container that persists across runs.
3. **Environment drift** — pooled containers can accumulate changes over time, reducing reproducibility.
4. **Hidden complexity** — safe pooling requires snapshot/restore mechanisms, strong cleaning scripts, and security scanning.
5. **Small performance gain** — with pre-pulled minimal images, fresh container startup is typically only tens to hundreds of milliseconds.

Pooling may be reconsidered only if:
- Startup latency becomes a verified bottleneck, **and**
- A secure snapshot/restore strategy is implemented.

### Reasoning
Fresh containers per job provide the strongest security and reproducibility guarantees with minimal implementation complexity.  
The slight increase in startup latency can be mitigated by caching base images locally.

### Risks
1. **Startup latency** — container creation is slower than reusing pooled containers.
2. **Image cache invalidation** — outdated images could persist if not refreshed properly.
3. **Cleanup failures** — leftover containers or volumes could accumulate if cleanup fails.

### Mandatory mitigations
- Pre-pull images on runner startup and refresh them periodically.
- Monitor container creation times; investigate if they exceed acceptable thresholds.
- Implement robust cleanup logic with retries and logging.
- Use OS-level tmp cleanup for orphaned files on restart.
- Alert on leftover containers or volumes after job completion.

### Tests & validation
- **Unit tests**:
  - Lifecycle manager correctly handles success, failure, and timeout cases.
  - Cleanup functions are idempotent.
- **Integration tests**:
  - Verify no data leaks between two consecutive jobs.
  - Verify no leftover containers/volumes after execution.
- **Performance tests**:
  - Measure cold vs warm container startup times.
- **Adversarial tests**:
  - Submission tries to persist files or processes; verify they are destroyed.

### Acceptance criteria
- [ ] Fresh container created for each job.
- [ ] Pre-pulled base images available at runner startup.
- [ ] All mounts, networks, and limits configured per decision specs.
- [ ] Cleanup executed and verified after every run.
- [ ] Logs contain unique container ID for each job.
- [ ] All unit, integration, and adversarial tests pass.

### Future-proofing
- Abstract container lifecycle into a `ContainerManager` interface to allow swapping between fresh-container and future secure pooling modes.
- Keep container creation and cleanup code isolated from job logic for maintainability.
- Allow future optimization by using snapshot-based warm-start containers with verified state integrity.
