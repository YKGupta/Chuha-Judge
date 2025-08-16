# Implementation Plan — Minimal Container Execution Service

This issue tracks the implementation of the minimal container execution service, based on the ITDs reviewed and accepted. Each section corresponds to a decision with its own definition of done and checklist.

---

## 1. Service Separation

**Summary:** Keep `backend/` and `container-service/` as two independent services inside the same Git repository. Each will be built and deployed as separate containers.

**Definition of Done:**

* `backend/` and `container-service/` remain separate top-level directories.
* Each service has its own `Dockerfile` and independent dependency management.
* Runner service is **not exposed publicly**, only backend can call it.
* Docker Compose / K8s manifest provides internal networking between backend and runner.

**Checklist:**

* [ ] Create Dockerfile for `backend/`
* [ ] Create Dockerfile for `container-service/`
* [ ] Add Docker Compose setup with internal network
* [ ] Verify backend → runner HTTP request works locally
* [ ] Verify runner is inaccessible externally

---

## 2. Language Choice

**Summary:** Implement the runner in **Node.js** to stay aligned with the backend stack and simplify development.

**Definition of Done:**

* Runner service codebase bootstrapped with Node.js.
* `package.json` initialized inside `container-service/`.
* ESLint / Prettier added for consistency with backend.

**Checklist:**

* [ ] Bootstrap Node.js app in `container-service/`
* [ ] Add linting + formatting setup
* [ ] Verify independent `npm install` works

---

## 3. Execution Backend

**Summary:** Use **Docker** as the execution backend for running untrusted code.

**Definition of Done:**

* Docker confirmed as required runtime dependency.
* Local developer setup documented.
* All executions run inside Docker containers.

**Checklist:**

* [ ] Document Docker install requirement in `README`
* [ ] Add `docker version` healthcheck to runner service startup
* [ ] Verify a sample container runs from runner service

---

## 4. Communication with Docker

**Summary:** Use **Dockerode** (Node.js Docker SDK) for programmatic container management.

**Definition of Done:**

* Dockerode added to `container-service` dependencies.
* Container lifecycle (create → start → wait → capture logs → remove) implemented via Dockerode.
* Errors surfaced cleanly.

**Checklist:**

* [ ] Install Dockerode in `container-service/`
* [ ] Implement wrapper around Dockerode for container lifecycle
* [ ] Unit test container wrapper with a hello-world run

---

## 5. Security Flags

**Summary:** Apply strict security flags when running containers: no network, read-only FS, limited writable mounts.

**Definition of Done:**

* All containers launched with:

  * `--network none`
  * `--read-only` root filesystem
  * Explicit writable mounts (`/tmp`)
* CPU, memory, and output limits configured.

**Checklist:**

* [ ] Add flag configuration in container creation wrapper
* [ ] Verify network is disabled in test run
* [ ] Verify filesystem is read-only except mounted tmp

---

## 6. Image Strategy

**Summary:** Use prebuilt language base images. No dynamic builds during execution path.

**Definition of Done:**

* Base images pulled and cached on runner startup.
* Runner refuses job if requested language image not available.
* No `docker build` during submission execution.

**Checklist:**

* [ ] Define supported language base images
* [ ] Add pre-pull logic on service startup
* [ ] Verify job fails gracefully if image missing

---

## 7. Test Case Management

**Summary:** Version test cases to ensure reproducibility, rollback, and auditability.

**Definition of Done:**

* Test cases stored in versioned directories (`/testcases-v1/`, `/testcases-v2/`).
* Runner jobs log the test case version used.
* Switching to a new version is atomic (pointer change only).

**Checklist:**

* [ ] Set up versioned test case directories
* [ ] Add metadata logging for test case version in verdict logs
* [ ] Document update/rollback procedure

---

## 8. Result Capture & Comparison

**Summary:** Capture stdout, stderr, and exit code; compare against expected outputs.

**Definition of Done:**

* Runner captures execution result (stdout, stderr, exit code).
* Results compared with expected output using Codeforces-style rules (ignore trailing spaces, etc.).
* Verdict computed deterministically.

**Checklist:**

* [ ] Implement output capture from container logs
* [ ] Add comparator module (Codeforces-style)
* [ ] Unit test with sample inputs/outputs

---

## 9. Metrics Collection

**Summary:** Collect execution metrics (CPU time, memory, exit status) for each run.

**Definition of Done:**

* Runner collects runtime metrics from Docker stats.
* Verdict enriched with metrics data.
* Metrics exposed in logs for monitoring.

**Checklist:**

* [ ] Add Docker stats capture during execution
* [ ] Parse and attach metrics to verdict object
* [ ] Verify logs show correct CPU/memory usage

---

## 10. Container Lifecycle

**Summary:** Use **fresh ephemeral container per job**. Always cleanup after execution.

**Definition of Done:**

* Each job creates a new container from base image.
* Container auto-removed after execution (normal or abnormal).
* Volumes and temp dirs cleaned up.
* Cleanup idempotent and logged.

**Checklist:**

* [ ] Implement per-job container creation/removal
* [ ] Add cleanup logic with retries
* [ ] Verify no leftover containers/volumes after multiple runs

---

## 11. Deployment & Scaling

**Summary:** Deploy backend and runner as separate services (same repo, different containers). Start with HTTP-based communication, evolve to queue-based at scale.

**Definition of Done:**

* Both services run as separate containers via Docker Compose / K8s.
* Backend communicates with runner via HTTP POST.
* Runner not exposed publicly.
* Clear scaling path documented (HTTP → LB → Queue).

**Checklist:**

* [ ] Write Docker Compose with backend + runner services
* [ ] Add backend → runner HTTP client with timeout/retry
* [ ] Verify multiple runner instances behind LB
* [ ] Document scaling plan in repo docs

---

✅ With all above sections, we’ll have a **minimal but secure, reproducible, and horizontally scalable container execution service** ready.