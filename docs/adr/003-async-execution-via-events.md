# ADR-003: Asynchronous Execution via Event-Driven Architecture

## Status

Accepted

## Context

Code execution is time-consuming and must not block API requests. The system is being deployed on a serverless platform with cost constraints.

## Decision

Use an event-driven async flow:

```text
API → Pub/Sub → Cloud Run Worker → DB update
```

* API stores submission (`pending`)
* Publishes event
* Worker executes code and updates result

## Consequences

### Positive

* Fully non-blocking system
* No need for self-managed queues or VMs
* Scales automatically with Cloud Run
* Reliable due to Pub/Sub retries

### Negative

* Requires idempotent workers
* Slightly more complex than direct execution
