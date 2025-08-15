## ITD — Container Runtime Choice (Docker)

### Summary statement
Use **Docker** as the container runtime for the minimal execution service, with a hardened default configuration and an abstraction layer that allows swapping the runtime (e.g., containerd, gVisor, Firecracker) later if stronger isolation or different performance characteristics are required.

### Context
The container execution service must run untrusted user code in isolated environments, enforce resource limits, and return execution results. The engineering team has Docker operational experience and the project must be delivered quickly as a minimal, functional runner. Docker provides broad language image support, resource control primitives, and a mature ecosystem (image registries, tooling, and libraries like `dockerode`) that enables rapid development.

An ideal runtime solution would:
- Provide strong isolation suitable for untrusted code execution.
- Offer fast startup and predictable resource limits.
- Be easy to integrate and operate by the team.
- Be replaceable if the threat model or scale demands change.

### Problem to solve
Choose a container runtime that balances delivery speed, operational complexity, and security for executing arbitrary user-submitted code.

### Options

#### Option 1 — Docker (selected)
Run each submission inside Docker containers, orchestrated by the runner service (via `dockerode`), with hardened runtime flags and placement on dedicated nodes.

#### Option 2 — Docker + gVisor (or use gVisor runtime)
Run containers with gVisor as a user-space kernel isolator on top of Docker/containerd to increase sandboxing.

#### Option 3 — MicroVMs (Firecracker / Kata)
Execute code inside microVMs for stronger isolation but higher integration complexity and potentially higher latency.

#### Option 4 — containerd / CRI + custom agent
Use containerd directly or a CRI-compatible runtime for lower-level control and potentially smaller attack surface; more initial engineering effort.

### Reasoning
Docker is selected for the minimal runner because:
- It enables **fast implementation** using existing team skills and libraries (`dockerode`).
- It supports **multi-language execution** through official language images.
- It exposes resource controls (memory, CPU, pids) and lifecycle primitives needed for an early delivery.
- Alternatives (gVisor, Firecracker, containerd direct) provide stronger isolation but increase implementation complexity and time-to-first-run.

However, Docker in its default configuration is **not** secure enough for running untrusted code at scale without hardening. Therefore the selection mandates strict runtime hardening, placement, and an abstraction layer to enable future migration.

### Risks
1. **Container escape / kernel vulnerability** — containers share the host kernel; kernel vulnerabilities could be exploited.
2. **Docker socket compromise** — access to Docker daemon is effectively root on host.
3. **Network & lateral movement** — default networking may allow containers to interact with host or other containers.
4. **Resource leaks** — orphan containers, images, and volumes may accumulate if cleanup fails.
5. **Performance/startup latency** — cold container start latency may be significant for small/interactive jobs.
6. **Operational burden** — Docker daemon lifecycle, image management, and host patching add operational responsibilities.

### Mandatory mitigations (must be implemented before accepting untrusted public traffic)
- **Runtime hardening (applied to every execution)**:
  - Use `--cap-drop=ALL` and only add capabilities when strictly needed.
  - Set `--security-opt=no-new-privileges`.
  - Apply a strict **seccomp profile** (not `unconfined`).
  - Use AppArmor or SELinux policies where available.
  - Run processes inside the container as a **non-root user** (USER set in image or docker run).
  - Use `--read-only` root filesystem + bind only required writable tmp dir.
  - Set `--pids-limit`, `--memory`, and `--cpus` according to problem/user-defined limits.
  - Default to `--network none` (or isolated network namespace) and only enable network for tests that require it under controlled conditions.
- **Docker daemon access**:
  - **Do not** mount host Docker socket into multi-tenant containers.
  - Run the runner on dedicated hosts that have local Docker socket access; restrict access to runner process only.
  - Where feasible, use Docker Engine with TLS client authentication or rootless Docker to reduce host risk.
- **Ephemeral execution model**:
  - Use per-execution ephemeral working directories.
  - Ensure deterministic cleanup: container removed, volumes deleted, temp directory purged even on crashes (watchdog/garbage-collector).
- **Image management**:
  - Pull minimal, trusted base images (official images) and regularly scan images for vulnerabilities.
  - Use immutable, pinned image digests (avoid `:latest` in production).
- **Monitoring & observability**:
  - Log container lifecycle events, stdout/stderr, and resource metrics; correlate logs with request IDs.
  - Export Prometheus metrics for container start failures, OOMs, hard kills, and verdict distribution.
- **CI & security testing**:
  - Run integration tests that exercise the hardening (attempts to escape, filesystem access).
  - Periodically run security fuzz tests / pentests targeted at container escape techniques.
- **Operational policy**:
  - Keep runner hosts patched with kernel/security updates on a defined cadence.
  - Limit who can deploy changes to runner hosts; store secrets (if any) in a secrets manager.

### Design constraints / implementation notes
- **Runtime abstraction**: implement a `runtime` interface in code (e.g., `createContainer`, `start`, `wait`, `getStats`, `cleanup`) so alternative backends (containerd, Firecracker) can be swapped later without changing the API layer.
- **Image pinning**: all runtime images must be pinned by digest in configuration.
- **Prewarm / pooling**: if startup latency is problematic, implement a pool of prewarmed containers or language-specific warmers as a follow-up.
- **Dedicated runner nodes**: place runner service and its containers on dedicated nodes (not shared with other services).
- **No SSH or bind mounts to sensitive host paths**: do not mount host home, /etc, or other sensitive paths into containers.

### Testing & validation
- **Unit & integration tests**:
  - Unit tests for runtime abstraction and comparator logic.
  - Integration tests that create real containers and validate:
    - Successful execution for sample programs.
    - Timeouts: container killed on wall-clock limit.
    - Memory limit enforcement and OOM detection.
    - Compilation/runtime error propagation.
    - Filesystem isolation: container cannot read host-sensitive files when not mounted.
- **Security regression tests**:
  - Run known container escape PoCs in CI in a controlled environment to validate hardening.
  - Validate that `no-new-privileges`, seccomp, capabilities, and non-root user are actually applied.
- **Chaos tests**:
  - Simulate docker daemon crash and validate cleanup/retry logic.
- **Performance tests**:
  - Benchmark cold start times and assess whether prewarm/pooling is required.
  - Load test to target concurrency to confirm horizontal scaling plan.

### Acceptance criteria
- Runner uses Docker as runtime with all mandatory mitigations implemented and verified in CI.
- Docker interactions are encapsulated by a clear runtime abstraction (adapter interface).
- Images are pinned and scanned; use of `:latest` prohibited in production config.
- Network is disabled by default for executions; only allowed via explicit, audited tests.
- Integration tests that validate timeouts, memory limits, and cleanup pass in CI.
- Monitoring/metrics and structured logging are in place and integrated with platform monitoring (Prometheus/ELK or equivalent).
- Documentation exists detailing host placement, required kernel/apparmor settings, and deployment steps.
- A documented migration plan exists to replace Docker backend with a stronger isolation runtime (gVisor/Firecracker/containerd) if needed.

### Migration & future-proofing
- Implement and test the runtime adapter to make swapping the runtime straightforward.
- Maintain a prioritized evaluation plan for stronger isolation alternatives:
  1. gVisor (lower engineering effort; improved isolation).
  2. Firecracker or Kata (microVMs — strongest isolation; higher complexity and cost).
  3. containerd + custom runtime (lower-level control).
- Gather telemetry (escape attempts, hard kills, OOMs, execution latency) and define quantitative thresholds that will trigger migration planning (e.g., X% of executions show suspicious behavior or escape attempts; median startup > Y ms causing unacceptable latency).

### Operational notes
- Runner hosts should be dedicated and regularly patched.
- Consider running runners in a controlled VPC with restricted egress.
- Enforce least privilege for CI/CD that can push images or change runner config.

