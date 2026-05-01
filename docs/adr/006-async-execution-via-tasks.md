# ADR-006: Asynchronous Execution via Cloud Tasks (Push-Based Task Queue)

## Status

Accepted

## Context

Code execution in the Online Judge system is:

* **Long-running** (can take seconds)
* **Resource-intensive** (CPU, memory, process isolation)
* **Unpredictable** (user-submitted code)

Executing code synchronously within the API layer would:

* Increase risk of **request timeouts**
* Couple API performance with execution workload
* Reduce system reliability under load

The system is deployed on a serverless platform and must:

* Minimize operational overhead
* Scale automatically
* Maintain predictable execution behavior

---

## Decision

Use a push-based task queue with:

* Google Cloud Tasks for job scheduling
* Google Cloud Run for execution workers

### Architecture

```txt
API → Cloud Tasks → Cloud Run (/execute) → DB update
```

### Flow

1. API receives submission request
2. Stores submission with status = `pending`
3. Enqueues a task containing `{ submissionId }`
4. Cloud Tasks dispatches an HTTP request to `/execute`
5. Worker:

   * Fetches submission from DB
   * Executes code
   * Updates result (`success` / `failed`)
   * Returns HTTP 2xx
6. Cloud Tasks:

   * Marks task complete on success
   * Retries on failure

---

## Key Design Constraints

### 1. Idempotent Execution

Due to at-least-once delivery semantics:

* Worker must handle duplicate executions safely
* Execution should be skipped if submission is already processed

---

### 2. Concurrency Control

Execution concurrency is controlled via:

* Cloud Tasks:

  * `maxConcurrentDispatches` → limits total parallel executions
* Cloud Run:

  * `concurrency = 1` → ensures one execution per container

This ensures:

* Strong isolation
* Predictable resource usage
* Protection against CPU/memory contention

---

### 3. Payload Design

Tasks contain only:

```txt
submissionId
```

Worker fetches full data from the database.

Benefits:

* Smaller payloads
* Safer retries
* Decoupled data handling

---

### 4. Retry Behavior

Cloud Tasks automatically retries failed executions:

* Non-2xx response → retry
* Timeout → retry

Worker must be safe under retries.

---

### 5. Local Development Strategy

Since Cloud Tasks cannot run locally:

* Use a local abstraction:

  * Direct execution (`executeSubmission`) in development
  * Cloud Tasks in production

This avoids infrastructure dependency during development.

---

## Consequences

### Positive

* Fully non-blocking API
* Clean separation of concerns (API vs execution)
* Automatic retry handling
* Controlled concurrency and scaling
* Minimal operational overhead (serverless)
* Simpler mental model compared to Pub/Sub

---

### Negative

* Requires idempotent worker design
* Requires careful concurrency tuning
* Harder debugging due to distributed execution
* Less flexible than event-driven systems (no fan-out)

---

## Alternatives Considered

### 1. Google Cloud Pub/Sub

* More flexible (supports event-driven architectures)
* Supports fan-out and streaming

**Rejected because:**

* Adds unnecessary complexity for a task queue use case
* Requires explicit handling of ACK deadlines and duplicates
* Not as aligned with single-consumer job processing

---

### 2. Synchronous Execution

```txt
API → Execute → Return response
```

**Rejected because:**

* Risk of request timeouts
* Poor UX
* Tight coupling between API and execution workload

---

## Notes

This design treats Cloud Tasks as a **work queue**, not an event system.

Future evolution may include:

* Dead-letter queues for failed executions
* Execution status tracking improvements
* Worker autoscaling tuning based on load
