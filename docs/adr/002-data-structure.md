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
  "difficulty": "easy | medium | hard",
  "description": "...",
  "constraints": "...",
  "limits": {
    "time": 1000,
    "memory": 256
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### testcases

```json
{
  "_id": "...",
  "problemId": "...",
  "input": "...",
  "output": "...",
  "isSample": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### submissions

```json
{
  "_id": "...",
  "userId": "...",
  "problemId": "...",
  "code": "...",
  "language": "java | python",
  "status": "pending | running | accepted | wrong_answer | time_limit_exceeded | runtime_error | compilation_error",
  "execution": {
    "time": 120,
    "memory": 64
  },
  "createdAt": "...",
  "updatedAt": "..."
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
