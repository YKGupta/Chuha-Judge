## **ITD — Language & Framework for Container Execution Service**

### Summary statement

Use **Node.js with Express** and `dockerode` to implement the container execution service, leveraging existing backend language familiarity, rapid development, and mature ecosystem support, with strict operational and security mitigations.

---

### Context

The container execution service will:

* Accept HTTP requests containing code, language, and problem ID.
* Run the code in an isolated Docker container with resource limits.
* Return execution results including verdict, execution time, and memory usage.

The existing backend is implemented in Node.js, and the engineering team has strong JavaScript experience. The runner service will be primarily I/O-bound, orchestrating containers rather than executing CPU-heavy work in-process.

An ideal implementation language and framework would:

* Minimize onboarding and development time.
* Provide stable, mature Docker orchestration libraries.
* Support lightweight, stateless service design.
* Allow easy horizontal scaling.
* Integrate cleanly with future queue-based execution.

---

### Problem to solve

Select the primary implementation language and framework for the container execution service, balancing speed-to-market, maintainability, and operational safety while minimizing integration friction with the existing backend ecosystem.

---

### Options

#### Option 1 — **Node.js + Express (selected)**

Reuse backend stack and leverage `dockerode` for Docker interaction.

#### Option 2 — Python + FastAPI

Use `docker-py` for Docker control; introduces a new stack.

#### Option 3 — Go + native Docker API

High performance and low memory footprint; requires new language expertise.

---

### Reasoning

Node.js with Express is selected because it:

* Matches the team’s current skill set, reducing onboarding time.
* Allows shared libraries and data models between backend and runner.
* Has mature Docker control libraries (`dockerode`).
* Handles I/O-bound orchestration well due to its non-blocking event loop.
* Minimizes context switching during development, enabling faster delivery for the minimal runner.

Performance concerns are mitigated by the fact that containerized code execution is the bottleneck, not the orchestration process itself. Scaling can be handled via multiple runner instances. A future migration to Go remains an option if scaling demands increase.

---

### Risks

1. **Single-threaded architecture** — Node’s event loop can be blocked by synchronous operations.
2. **Docker socket security** — Direct access to `/var/run/docker.sock` grants root-equivalent privileges.
3. **Container sandbox escape** — Docker’s default security settings are insufficient for untrusted code execution.
4. **Scaling limits** — High concurrency workloads may require horizontal scaling or eventual reimplementation in a systems language.

---

### Mitigations (must be implemented before production)

* **TypeScript adoption** for safety and maintainability.
* **Non-blocking code**: prohibit synchronous file/process operations in request paths.
* **Docker API security**:

  * Prefer TLS-secured remote API or rootless Docker on dedicated hosts.
  * Avoid mounting Docker socket into multi-tenant containers.
* **Container hardening**:

  * `--memory`, `--cpus`, `--pids-limit`
  * `--cap-drop ALL`, `--security-opt no-new-privileges`
  * Hardened seccomp profile and AppArmor/SELinux.
  * Non-root container user.
  * `--network none` by default.
* **Resource cleanup**:

  * Ephemeral working directories per execution.
  * Guaranteed cleanup even on crash (watchdogs, cleanup jobs).
* **Observability**:

  * Structured logs with request ID and container ID.
  * Prometheus metrics: execution counts, verdict breakdown, errors, OOM kills.
  * Readiness/liveness probes.
* **Testing**:

  * Integration tests with real Docker execution.
  * Security regression tests with malicious inputs.

---

### Acceptance criteria

* Service implemented in Node.js with Express, using TypeScript.
* No synchronous blocking operations in execution path.
* Docker interaction abstracted into a dedicated `runner` module.
* All security mitigations in place before accepting untrusted user code.
* Metrics, logs, and cleanup processes functional.
* Load test confirms ability to handle target concurrency with acceptable latency.
* Migration path to Go documented for potential future scaling.