## ITD — Execution Isolation & Security Model for Container Execution Service

### Summary statement
Enforce a strict, security-first container isolation model for the execution service: run each submission inside a Docker container with hardened defaults (capability drop, seccomp, no-new-privileges, non-root user, read-only rootfs + tmpfs, network disabled by default, cgroup limits, PID/ulimit limits), run the runner on dedicated or rootless hosts, and require CI-verified adversarial tests and observability before accepting untrusted traffic.

### Context
The runner will execute arbitrary, untrusted user code. Containers share the host kernel; default Docker behavior is insufficiently secure for multi-tenant, untrusted workloads. The service must protect host integrity, other tenants, and the organization’s infrastructure while still providing reliable and measurable execution for users. The minimal runner must be deliverable quickly, but cannot be exposed to untrusted traffic without mandatory hardening, tests, and monitoring.

An ideal isolation solution would:
- Provide strong practical isolation against container escape and privilege escalation.
- Enforce predictable resource limits and deterministic failure modes (TLE, MLE).
- Be automatable and auditable with CI verification.
- Be swappable later for stronger isolation (gVisor/Firecracker) if telemetry demands it.

### Problem to solve
How to run untrusted code safely and reliably such that host compromise risk is minimized and execution results remain accurate and auditable.

### Options

#### Option 1 — Hardened Docker (selected)
Use Docker containers with an enforced set of hardened runtime flags and host placement controls for every execution. Encapsulate defaults in the runtime adapter so they cannot be bypassed.

#### Option 2 — Docker + additional isolation layer (gVisor)
Run containers under gVisor (as a runtime) to reduce syscall/kernel exposure while keeping the Docker/containerd ecosystem. Higher complexity to configure and test.

#### Option 3 — MicroVMs (Firecracker / Kata)
Use microVMs per execution for strong isolation. Highest safety but significantly higher latency, cost, and implementation complexity—not chosen for initial minimal runner.

#### Option 4 — Rootless / user-namespaced Docker on dedicated hosts
Run Docker in rootless mode or with user namespaces to reduce host privilege mapping. Good complement to Option 1; may require extra image and host adjustments.

### Selected option
**Option 1 (Hardened Docker) with mandatory host placement & future migration plan.**  
Rationale: fastest to implement with required mitigations in place. Must be treated as a guarded baseline — telemetry and security testing will determine if migration to gVisor/microVMs is later required. Use Option 4 practices (rootless/user-namespaces) where feasible as an additional hardening layer.

### Risks
1. **Container escape / kernel-level vulnerability** — container shares host kernel; escapes are possible if kernel or container config is vulnerable.
2. **Docker daemon compromise** — access to Docker socket is equivalent to host root control.
3. **Misconfiguration bypass** — if hardening flags are missed, containers may run with excessive privileges.
4. **Resource exhaustion** — runaway jobs or leaks can impact host stability.
5. **Latency tradeoff** — hardened defaults may increase startup time; prewarming must be carefully hardened.

### Mandatory mitigations (must be implemented before public/untrusted traffic)
**Runtime flags & container config (applied on every execution):**
- `--cap-drop=ALL`
- `--security-opt=no-new-privileges`
- `--security-opt seccomp=/path/to/restrictive-profile.json` (do not use `unconfined`)
- Use AppArmor or SELinux profile where available.
- `--read-only` root filesystem and provide a `--tmpfs /tmp:rw,noexec,nosuid,size=<X>` for writable needs.
- `--user` to run as a non-root UID (or build images with `USER <nonroot>`).
- `--network none` by default (only enable per-test with strict egress control).
- `--memory=<limit>` and `--memory-swap=<same>` (no swap); tune per-language/problem.
- CPU limits: `--cpus` or `--cpu-quota`/`--cpu-period`.
- `--pids-limit=<limit>` to prevent fork bombs.
- `--ulimit nofile` and `--ulimit nproc` to reasonable limits.
- Mount only required input files read-only. Never bind mount sensitive host paths.
- Do **not** mount `/var/run/docker.sock` into user containers.

**Host & deployment:**
- Place runner and containers on **dedicated hosts/nodes** (no co-location with app servers that hold secrets).
- Prefer rootless Docker or enable user namespaces where supported; document ramifications.
- Minimize host attack surface (minimal host images, restricted services, up-to-date kernels).
- Enforce image pinning by digest; scan images and block images with critical CVEs.

**Operational & code controls:**
- Implement a watchdog in the runner that enforces wall-clock timeouts (SIGTERM grace → SIGKILL).
- Ensure per-execution ephemeral work directories and guaranteed cleanup; implement GC for orphaned artifacts.
- Bounded output capture: ring buffer or write-to-disk + tail; truncate outputs over threshold and flag with `output_truncated`.
- Encapsulate all runtime defaults in the runtime adapter; no other code path may spawn containers without the adapter.
- CI must include adversarial escape PoC tests and validate that the seccomp/profile/no-new-privileges/etc. are actually applied.

### Tests & validation (mandatory)
- **Integration tests** (CI, Docker-enabled):
  - Assert container config (inspect) includes all mandatory flags for a sample execution.
  - Validate TLE (watchdog kills), MLE (OOM handling), and PID limit enforcement.
  - Large-output tests to ensure truncation/stream-bounding behavior.
- **Adversarial tests**:
  - Run known container escape PoCs in controlled CI jobs and assert no host compromise or sensitive file access.
  - Attempt filesystem access to host sensitive files; assert failures.
- **Chaos tests**:
  - Simulate Docker daemon crash during execution; ensure cleanup and safe failure modes.
  - Simulate disk full / resource pressure and ensure graceful degradation.
- **Periodic pentest**:
  - Annual (or on-major-release) penetration test focusing on container escape and host compromise paths.

### Observability & SLOs (mandatory)
- Metrics: `execution_started_total`, `execution_completed_total{verdict}`, `execution_duration_seconds`, `container_kill_count`, `container_oom_count`, `truncated_output_count`, `container_create_errors`.
- Structured logs containing `request_id`, `exec_id`, `container_id`, `image`, `language`, `start_ts`, `end_ts`, `exit_code`, `verdict`, `memory_used`, `cpu_time`, `truncated_output`.
- Audit storage of execution metadata for a configurable retention period for forensic analysis.
- Alerts on high OOM rate, high kill count, orphaned artifacts beyond threshold, or container_create_errors spike.

### Acceptance criteria (hard gates)
- [ ] Runtime adapter enforces all flags by default for every execution and is covered by unit/integration tests.
- [ ] Seccomp profile implemented (not `unconfined`) and validated in CI tests.
- [ ] AppArmor/SELinux profile applied where supported (document platform exceptions).
- [ ] Non-root execution inside container enforced.
- [ ] Read-only rootfs with tmpfs for writable needs implemented and tested.
- [ ] Default `--network none` enforced; explicit network tests audited.
- [ ] Memory/CPU/PID/ulimit limits in place and tested (causes correct MLE/TLE verdicts).
- [ ] Watchdog implemented that forcibly kills timed-out tasks (SIGTERM -> SIGKILL).
- [ ] No binding of Docker socket into user containers; runner host socket placement documented.
- [ ] Output capture bounded and truncation flagged; tests validate behavior.
- [ ] CI includes adversarial PoC tests and they pass (no escapes, enforce flags).
- [ ] Monitoring, metrics, and logging are integrated and alerting configured.
- [ ] Deployment docs include host placement, kernel and Docker version requirements, and LSM configuration.

### Example secure run template (implement via runtime adapter; do not shell out in prod)
```

docker run --rm&#x20;
\--read-only&#x20;
\--tmpfs /tmp\:rw,noexec,nosuid,size=32m&#x20;
\--user 1000:1000&#x20;
\--cap-drop=ALL&#x20;
\--security-opt=no-new-privileges&#x20;
\--security-opt seccomp=/etc/runner/seccomp\_profile.json&#x20;
\--pids-limit=64&#x20;
\--memory=128m --memory-swap=128m&#x20;
\--cpus=0.5&#x20;
\--network=none&#x20;
\--ulimit nofile=1024:1024&#x20;
-v /var/lib/runner/work/<exec-id>/input.txt:/app/input.txt\:ro&#x20;
\<image\@sha256:...>&#x20;
/bin/sh -c "run-language-wrapper /app/input.txt"

```
(Values above are illustrative — tune per-language/problem via config.)

### Migration & future-proofing
- Keep isolation defaults in the runtime adapter to enable swapping Docker backend for gVisor/Firecracker/containerd without touching higher-level logic.
- Collect telemetry (escape attempts, OOMs, kill rates, startup latency). Define quantitative thresholds that will trigger migration planning to stronger isolation (e.g., persistent PoC attempts, high rate of suspicious behavior, or unacceptable security posture).
- Evaluate rootless Docker or per-execution microVMs in staging when telemetry or threat model requires stronger guarantees.

### Operational runbook highlights
- Garbage-collect orphaned containers/volumes older than X hours.
- Run periodic image scanning and patching cadence for runner hosts.
- Automatic alerting + on-call playbook for container escape indicators or mass failures.
- Document rollback & emergency isolation procedure for compromised runner host(s).

### Next steps (implementation order)
1. Implement runtime adapter with enforced hardening flags.
2. Create minimal per-language hardened base images and pin digests.
3. Implement watchdog, bounded stream capture, and GC for orphaned artifacts.
4. Add integration/adversarial tests to CI that validate applied hardening.
5. Enable metrics/logging and configure alerts.
6. Gate accepting untrusted traffic behind a feature flag until all acceptance criteria are satisfied.
