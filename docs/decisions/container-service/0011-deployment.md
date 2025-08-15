## ITD — Deployment & Scaling Model for Container Execution Service

### Summary statement
Deploy `backend/` and `container-service/` as two independent services within the same Git repository, each with its own Dockerfile and container. Connect them over an internal network, with the backend calling the runner via HTTP POST in the minimal version. Design for easy scaling to multiple runner instances and eventual migration to asynchronous queue-based execution.

### Context
The system consists of:
- **Backend API service** (`backend/`) — handles user authentication, problem definitions, submissions, and verdict persistence.
- **Container Execution Service** (`container-service/`) — securely runs untrusted code in Docker containers and returns metrics and verdicts.

Key goals:
- Maintain **clear separation** between backend logic and code execution logic.
- Allow **independent scaling** of execution service.
- Minimize initial complexity while keeping a **path to horizontal scaling**.

An ideal solution:
- Isolates runtime environments for security and performance.
- Avoids tight coupling that makes scaling difficult later.
- Minimizes deployment friction in early development.

### Problem to solve
Choose an initial deployment and scaling model that supports:
- Fast delivery of the minimal runner.
- Safe and efficient execution of untrusted code.
- A migration path to a horizontally scalable architecture without rewriting APIs.

### Options

#### Option 1 — Single process
Runner code runs inside the backend process.
- Pros: Simpler to start.
- Cons: Blocks backend during execution; scales poorly.

#### Option 2 — Separate service in same repo (selected)
Runner lives in `container-service/`, backend in `backend/`, both in the same Git repo.
- Each service has its own Dockerfile.
- Deploy as separate containers on the same internal network.
- Backend calls runner via HTTP POST.
- Pros: Isolation, independent scaling, single repo for coordinated development.
- Cons: Slightly more deployment setup.

#### Option 3 — Separate service in separate repo
- Pros: Full independence.
- Cons: More CI/CD overhead for early stage.

### Selected option
**Option 2**:
- Keep `backend/` and `container-service/` as top-level service directories in the same Git repo.
- Each service:
  - Own `Dockerfile` and build context.
  - Own dependencies (separate `package.json` if using Node.js).
- Deploy in Docker Compose or Kubernetes with:
  - Backend service.
  - Runner service.
  - Shared internal network.
- Backend sends synchronous HTTP POST requests to runner in Phase 1.

### Reasoning
- Keeps security and performance isolation without early microservice overhead.
- Single repo simplifies development while both services are evolving rapidly.
- Independent containers allow scaling runner nodes separately from backend nodes.
- Direct HTTP calls are simplest to implement now and can be swapped for queue later without API changes.

### Risks
1. **Backend tightly coupled to runner API** — mitigated by defining API contracts early.
2. **Scaling bottleneck** if using only synchronous HTTP — solved by future queue integration.
3. **Security misconfiguration** — if internal network isolation is not enforced, runner could be exposed.

### Mandatory mitigations
- Keep runner service internal-only (no public exposure).
- Define API contract for backend → runner communication in OpenAPI spec.
- Use environment variables for runner host/port configuration.
- Implement connection timeouts and error handling for runner calls.
- Set resource requests/limits per service to prevent resource starvation.

### Tests & validation
- **Integration tests**:
  - Backend sends valid job to runner and receives verdict.
  - Backend handles runner timeout or crash gracefully.
- **Load tests**:
  - Measure latency with multiple concurrent submissions.
  - Validate runner scaling behavior with multiple instances.
- **Security tests**:
  - Verify runner is inaccessible from public internet.

### Acceptance criteria
- [ ] `backend/` and `container-service/` each have their own Dockerfile.
- [ ] Docker Compose or Kubernetes config connects them over an internal network.
- [ ] Backend can send job to runner and receive response in under acceptable latency.
- [ ] Runner not publicly accessible.
- [ ] Scaling runner instances does not require backend code change.

### Future-proofing
- **Phase 2**: Scale runner horizontally with load balancer in front of multiple instances.
- **Phase 3**: Switch to asynchronous message queue for better throughput and retry logic.
- **Phase 4**: Move `container-service/` to its own Git repository if lifecycle diverges.
