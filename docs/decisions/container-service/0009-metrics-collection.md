## ITD — Execution Metrics & Verdicts for Container Execution Service

### Summary statement
Capture execution metrics (execution time, peak memory, exit code, termination signal, output size, stderr size) using Docker API streaming and container lifecycle events. Map results to standardized verdicts following Codeforces-style rules, store both metrics and verdict in persistent logs, and abstract metrics collection behind a `MetricsCollector` interface for future extensibility.

### Context
The execution service runs untrusted code in containers with strict time, memory, and output limits.  
Metrics are required to:
- Determine verdicts (Accepted, Wrong Answer, Time Limit Exceeded, etc.).
- Debug submission failures.
- Audit judging decisions for consistency and reproducibility.

An ideal approach would:
- Measure resource usage reliably without requiring untrusted in-container agents.
- Produce deterministic verdicts from consistent rules.
- Store metrics for every run for auditability.
- Allow for additional metrics in the future without breaking API contracts.

### Problem to solve
Select a secure and maintainable strategy for collecting execution metrics and mapping them to standardized verdicts in the containerized execution environment.

### Options

#### Option 1 — Docker API stats only
Use Docker’s `stats` API to collect peak memory, CPU, and network usage; use exit codes and signals for verdicts.

#### Option 2 — In-container resource agent
Run a small process inside container to record fine-grained metrics.

#### Option 3 — Hybrid approach (selected)
Use Docker API for primary metrics, container exit status for verdict mapping, and optional cgroup inspection for precise peak memory detection.

### Selected option
**Option 3 (Hybrid approach)**:
- Metrics captured:
  - `execution_time_ms` (wall-clock).
  - `cpu_time_ms` (optional for detailed debugging).
  - `peak_memory_kb` (Docker stats or cgroup).
  - `exit_code`.
  - `termination_signal` (SIGKILL, SIGSEGV, etc.).
  - `output_size_bytes`.
  - `stderr_size_bytes`.
- Verdict mapping priority order:
  1. Output Limit Exceeded
  2. Memory Limit Exceeded
  3. Time Limit Exceeded
  4. Runtime Error
  5. Wrong Answer
  6. Accepted
- Store raw metrics + verdict in persistent logs/DB for every execution.

### Reasoning
- Docker API provides sufficient precision for most use cases without exposing attack surface from in-container agents.
- Hybrid approach allows precision improvement later (via cgroup read) without architecture changes.
- Explicit priority ordering avoids ambiguous verdicts when multiple limits are hit in quick succession.
- Persisting metrics enables reproducibility and auditing.

### Risks
1. **Stats sampling gaps** — short-lived spikes may be missed if polling interval is too large.
2. **Ambiguous termination cause** — simultaneous limit breaches may produce inconsistent verdicts without a strict priority rule.
3. **Overhead from frequent polling** — high polling frequency increases CPU usage on runner nodes.
4. **Data volume growth** — storing metrics for every run can grow logs quickly.

### Mandatory mitigations
- Use a polling interval tuned to catch sub-second spikes (e.g., ≤100ms for MLE detection).
- Apply strict verdict mapping priority to resolve multi-breach cases deterministically.
- Store only essential metrics in persistent DB; archive detailed logs separately for short retention.
- Validate metric integrity before verdict mapping (no negative times, etc.).
- Ensure metrics collector cannot be influenced by containerized process.

### Tests & validation
- **Unit tests**:
  - Verdict mapping from synthetic metric sets.
  - Priority resolution for multi-breach cases.
  - Data validation rules.
- **Integration tests**:
  - Controlled execution to trigger each verdict type.
  - High-output run to test OLE detection.
  - Memory stress run to test MLE.
  - Infinite loop to test TLE.
- **Performance tests**:
  - Measure polling overhead under high concurrency.
- **Adversarial tests**:
  - Code attempting to manipulate exit codes or signals.

### Acceptance criteria
- [ ] `MetricsCollector` interface implemented with Docker API + optional cgroup read.
- [ ] All required metrics captured for each run.
- [ ] Verdict mapping applied with strict priority rules.
- [ ] Metrics and verdict stored for every execution in DB/log.
- [ ] Polling interval tuned for reliable spike detection.
- [ ] Unit/integration/adversarial tests for all verdict types pass.

### Future-proofing
- `MetricsCollector` interface allows swapping to more precise methods (e.g., kernel-level eBPF tracing).
- Additional metrics (thread count, syscall count, etc.) can be added without breaking current API.
- Verdict mapping table stored in config to allow contest-specific rules.
- Potential future integration with live monitoring dashboards.
