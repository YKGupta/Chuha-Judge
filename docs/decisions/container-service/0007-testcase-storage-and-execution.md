## ITD — Test Case Storage & Input Injection for Container Execution Service

### Summary statement
Store test cases in a versioned, read-only directory structure on the runner host for the minimal runner, mounting only the required case into containers at execution time. Wrap access in a pluggable `TestCaseProvider` to enable future migration to object storage without changing container injection logic.

### Context
The execution service must run untrusted user code against trusted test cases for each problem.  
Test cases include public and hidden inputs/outputs and must be securely injected into execution containers without exposing unrelated problems or modifying the data.  

An ideal approach would:
- Provide fast, predictable access to test data.
- Be secure against tampering and leakage.
- Support future scalability to multiple runner nodes.
- Maintain consistent container injection paths regardless of backend storage changes.

### Problem to solve
Determine a secure, performant, and maintainable method to store and inject problem test cases into execution containers.

### Options

#### Option 1 — Local disk storage (selected)
Store test cases in a local read-only directory tree (e.g., `/var/lib/runner/testcases/<problem-id>/<case-id>/{input.txt,output.txt}`) and mount only the needed files into containers.

#### Option 2 — Object storage
Store test cases in S3/MinIO/etc., fetch at runtime, and store temporarily before container execution.

#### Option 3 — Embedded in container images
Bake test cases into per-problem runner images.

### Selected option
**Option 1 (Local disk storage)** for the minimal runner:
- Versioned directory root (e.g., `/var/lib/runner/testcases-v1/`) to support atomic updates and rollbacks.
- Read-only mounts for test cases inside containers.
- Mount only the required test case files, never the full set.

### Reasoning
- Local disk reads are near-instant, avoiding network latency.
- Minimal operational complexity for initial implementation.
- Versioned directory approach enables controlled updates without downtime.
- Pluggable provider interface ensures migration to object storage is possible later without changing the container interface.

### Risks
1. **Sync drift** — test cases on runner nodes could become outdated if updates fail.
2. **Data leakage** — mounting too many files or incorrect paths could expose hidden tests.
3. **Scalability** — syncing test cases to multiple nodes may become slow at scale.
4. **Tampering** — if read-only enforcement fails, containerized code could modify test cases.

### Mandatory mitigations
- Store test cases in a root-owned directory; runner process runs as a non-root user.
- Mount into container as read-only using `:ro` bind mount.
- Mount only the needed files into fixed container paths (`/app/input.txt`, `/app/expected.txt`).
- Separate public and hidden tests on disk but treat both as trusted-only resources (never exposed via API).
- Use a versioned directory root and switch versions atomically (symlink or config switch).
- Implement checksum verification for test cases during sync to detect corruption.
- Use a `TestCaseProvider` abstraction to fetch the case paths, enabling swap to object storage later.

### Tests & validation
- Unit tests for `TestCaseProvider` to ensure correct path resolution and mounting.
- Integration test: run a container with mounted test case, verify read-only behavior.
- Adversarial test: user code attempts to modify or list `/app/expected.txt`; should fail.
- Test version switch process — old executions still see old version until new jobs start.

### Why version test cases

Versioning test cases ensures operational safety, reproducibility, and auditability in the execution service:

1. **Atomic updates** – Prepare the new version in full (e.g., `/testcases-v2`) and switch a symlink or config pointer only when validated. This prevents jobs from reading partially updated files.
2. **Rollback capability** – If an update introduces incorrect or corrupted cases, you can instantly revert to the previous version without downtime.
3. **Reproducibility of past runs** – Disputed verdicts or debugging requires re-running code against the exact test set used at submission time; versioning preserves these sets.
4. **Safe multi-node sync** – In a distributed setup, all nodes can sync the new version in advance and switch simultaneously, avoiding inconsistent judging across nodes.
5. **Auditability** – Logging the test case version used for each execution improves traceability and trust in results.

This approach trades small additional disk usage for significant operational reliability, making it standard practice in high-reliability judging systems.

### Acceptance criteria
- [ ] Test cases stored in versioned directory root (`testcases-vX`) owned by root.
- [ ] Runner mounts only required files into fixed container paths with `:ro` flag.
- [ ] Public and hidden tests stored separately but in same format.
- [ ] `TestCaseProvider` interface implemented with local disk as default.
- [ ] Sync/update process documented and includes checksum verification.
- [ ] Integration tests confirm mounted files are read-only inside container.
- [ ] Migration path to object storage documented and feasible without changing container interface.

### Future-proofing
- When scaling beyond a single node, implement object storage backend for `TestCaseProvider`.
- Consider compression/encryption for hidden test cases if stored externally.
- Maintain mount path contract inside container for maximum compatibility.
