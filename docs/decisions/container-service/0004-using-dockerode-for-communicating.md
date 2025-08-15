## ITD — Docker Control Library for Container Execution Service

### Summary statement
Use **dockerode** (Node.js Docker SDK) as the runtime control library to manage container lifecycle (create/start/attach/wait/cleanup) from the Node.js runner. Encapsulate all dockerode usage behind a small `RuntimeAdapter` interface to enable future replacement and to restrict usage surface area.

### Context
The runner service must orchestrate Docker containers for short-lived code execution tasks. Requirements include streaming stdout/stderr, enforcing resource limits, implementing timeouts, collecting stats, and robust cleanup. The team is implementing the runner in Node.js/TypeScript. There are several ways to interact with Docker from Node.js: a mature SDK (`dockerode`), raw HTTP/unix-socket calls, shelling out to the `docker` CLI, or using an intermediary agent. The chosen approach must balance developer velocity, reliability for streaming, maintainability, and a minimal dependency surface for production use.

### Problem to solve
Select the method by which the Node.js runner will interact with the Docker runtime that:
- Minimizes implementation time and risk,
- Supports robust streaming and lifecycle control,
- Keeps the surface area small to enable strict security controls and future runtime swaps.

### Options

#### Option A — `dockerode` (selected)
Use `dockerode` as the Node.js Docker client and wrap it inside a `RuntimeAdapter` layer.

#### Option B — Raw Docker HTTP API client
Implement a custom minimal HTTP client (unix socket / TLS) for only the endpoints needed.

#### Option C — Shell out to `docker` CLI
Use `child_process.spawn` / `exec` to call `docker run`, `docker logs`, etc.

#### Option D — Intermediary agent
Run a local hardened agent (e.g., written in Go) exposing a tight RPC that performs Docker actions; runner talks to agent via gRPC/HTTP.

#### Option E — containerd/CRI integration
Bypass Docker daemon and talk to containerd or a CRI runtime directly.

### Selected option
**Option A — dockerode**, with these constraints:
- All dockerode usage MUST be isolated in a single `RuntimeAdapter` module.
- Streaming-first design (no unbounded buffering of stdout/stderr).
- Strict TypeScript types and unit/integration test coverage.
- Pin and audit dockerode dependency versions.

### Reasoning
- `dockerode` is mature and provides high-level primitives for container lifecycle and streaming, reducing implementation complexity and risk compared to reimplementing HTTP or parsing CLI output.
- It allows fast delivery, which aligns with the minimal-runner goal.
- Wrapping dockerode behind an adapter enables future replacements (e.g., intermediary agent, containerd) without affecting the rest of the codebase.
- The raw HTTP approach (Option B) would require reimplementing complex streaming behavior and multipart endpoints, increasing bug risk. CLI approach (Option C) is brittle and hard to maintain for streaming/observability. Intermediary agent (Option D) is attractive for long-term security but increases system complexity and time-to-first-run; it can be introduced later as the adapter consumer or as a replacement runtime backend.

### Risks
1. **Third-party dependency risk**: `dockerode` vulnerabilities or bugs could affect the runner.
2. **Streaming/backpressure**: incorrect implementation can lead to unbounded memory growth when containers emit large outputs.
3. **Operational security**: dockerode requires access to Docker API (socket or TLS), raising host privilege concerns.
4. **Hidden edge-cases**: SDK abstractions may hide subtle behaviors (chunked streams, partial detach, Docker restarts) which must be explicitly handled.
5. **Future migration cost**: while adapter reduces cost, a runtime switch (to gVisor/Firecracker/agent) still requires engineering effort.

### Mandatory mitigations (must be implemented before production)
- **Adapter pattern**:
  - Implement a `RuntimeAdapter` interface (TypeScript) that is the only code importing `dockerode`.
  - Adapter methods: `createExecution`, `start`, `attachStreams`, `wait`, `getStats`, `kill`, `cleanup`.
- **Streaming-first, bounded buffers**:
  - Stream container stdout/stderr to disk or a bounded in-memory rolling buffer (configurable limit, e.g., 64 KB per stream).
  - Use Node `stream.pipeline` and tune `highWaterMark` for expected workloads.
  - Drop/trim excess output and record a flag that output was truncated.
- **TypeScript + strict lint**:
  - Write the adapter in TypeScript with precise types and enable `noImplicitAny`, `strict` mode.
- **Dependency hygiene**:
  - Pin `dockerode` to a specific minor/patch version and run dependency scanning (`npm audit`, SCA).
  - Add CI policy to approve version updates.
- **Idempotent cleanup**:
  - Cleanup operations must be idempotent (multiple calls safe).
  - Adapter must handle partial states (container created but start failed).
- **Robust error handling and retries**:
  - Implement retries with backoff for transient Docker daemon errors.
  - Fail fast on persistent errors and surface clear diagnostics.
- **Secure daemon access**:
  - Runner must run on dedicated hosts with controlled access to Docker socket.
  - Avoid exposing the socket to other containers; prefer Docker over TLS where feasible.
- **Observability**:
  - Emit metrics for adapter errors, container create/start latencies, stream bytes, truncated outputs.
  - Correlate container IDs with request IDs in logs. Log lifecycle events (create/start/kill/cleanup).
- **Integration tests**:
  - CI must run integration tests that use real Docker to validate streaming, kills, restarts, and cleanup.

### Implementation guidance & patterns
- **Adapter shape** (example):
  ```ts
  interface RuntimeAdapter {
    createExecution(opts: ExecutionOptions): Promise<ContainerMeta>;
    start(containerId: string): Promise<void>;
    attachStreams(containerId: string): Promise<{ stdout: Readable, stderr: Readable }>;
    wait(containerId: string, timeoutMs?: number): Promise<ExecutionResult>;
    getStats(containerId: string): Promise<Stats>;
    kill(containerId: string, signal?: string): Promise<void>;
    cleanup(containerId: string): Promise<void>;
  }
````

* **No direct dockerode imports outside adapter**: enforce via linting or code review.
* **Stream handling**:

  * Stream to temporary files and tail the files for returning limited output to API consumer.
  * Or implement a ring buffer stream that keeps last N bytes.
* **Testing**:

  * Mock dockerode in unit tests of business logic.
  * Run integration tests against a Docker-in-Docker or local Docker engine in CI runner matrix.

### Tests & acceptance criteria

* [ ] `RuntimeAdapter` implemented with TypeScript types and unit tests mocking dockerode.
* [ ] Integration tests using real Docker that verify:

  * streaming of stdout/stderr works and is bounded,
  * timeouts cause container kill and cleanup,
  * OOMs and memory limits are detected,
  * adapter handles Docker daemon restart mid-execution (cleanup/retry),
  * large-output programs do not cause OOM and are truncated with a flag.
* [ ] CI pipeline runs integration tests in an isolated Docker-enabled environment.
* [ ] Metrics emitted for adapter errors, stream bytes, and truncations.
* [ ] `dockerode` is pinned in `package.json` and SCA tools are enabled.
* [ ] Security doc describing how runner accesses Docker (socket placement, required host config) exists and approved.
* [ ] Codebase contains migration notes showing how to replace adapter with an intermediary agent or other runtime.

### Migration & future-proofing

* Because all interactions are behind `RuntimeAdapter`, replacing dockerode with raw HTTP, an intermediary agent, or a Go-based runtime agent requires only adapter changes.
* If in future security or scale demands increase, implement an intermediary agent (Option D) and change adapter to speak gRPC/HTTP to that agent instead of dockerode.

### Operational notes

* Treat the adapter as a critical component in on-call runbooks. Failures in the adapter (e.g., inability to create/start containers) should have clear alarm rules.
* Regularly review and update pinning and vulnerability reports for dockerode.
* Document expectations for runner host (Docker version, kernel versions, seccomp/APParmor expectations).
