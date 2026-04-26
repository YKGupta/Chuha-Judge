# ADR-004: Submission Lifecycle Design

## Status

Accepted

## Context

Submissions need a clear lifecycle for processing and result tracking.

## Decision

Use a simple state machine:

```text
pending → running → accepted | wrong_answer | tle | re
```

Database is the single source of truth for submission state.

## Consequences

### Positive

* Easy to reason about
* Works well with async processing
* Extendable later

### Negative

* Limited detail for debugging initially
* May need more states later
