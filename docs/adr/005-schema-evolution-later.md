# ADR-005: Schema Evolution Strategy

## Status

Accepted

## Context

The schema will evolve as the system grows.

## Decision

* Prefer additive changes (new fields)
* Avoid breaking changes (renames/removals)
* Handle missing fields gracefully in code

## Consequences

### Positive

* Backward compatibility
* Fast iteration
* No need for strict migrations early

### Negative

* Temporary inconsistencies across documents
* Slightly more defensive coding required
