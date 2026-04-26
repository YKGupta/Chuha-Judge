# ADR-002: Core Data Model (Minimal Collections)

## Status

Accepted

## Context

We need the smallest possible schema to support:

* problems
* submissions
* judging

## Decision

Use four core collections:

* `users`
* `problems`
* `testcases`
* `submissions`

Testcases are stored separately and linked via `problemId`.

#### problems

```json
{
  "_id": "...",
  "title": "...",
  "slug": "...",
  "difficulty": "...",
  "description": "...",
  "limits": {
    "time": 1000,
    "memory": 256
  }
}
```

#### testcases

```json
{
  "_id": "...",
  "problemId": "...",
  "input": "...",
  "output": "...",
  "isSample": true
}
```

#### submissions

```json
{
  "_id": "...",
  "userId": "...",
  "problemId": "...",
  "code": "...",
  "language": "...",
  "status": "pending",
  "createdAt": "..."
}
```

## Consequences

### Positive

* Minimal and clean structure
* Easy to extend (execution data, verdicts, etc.)
* Avoids oversized documents

### Negative

* Requires multiple queries (no joins)
* Slightly more application-level logic
