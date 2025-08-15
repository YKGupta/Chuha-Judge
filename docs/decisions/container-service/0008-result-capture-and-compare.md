## ITD — Execution Result Capture & Comparison for Container Execution Service

### Summary statement
Capture stdout/stderr from the container process via Docker API streaming with enforced real-time output size limits, apply container-level time and memory limits, and perform Codeforces-style normalized output comparison with optional floating-point tolerance. Store mismatch details in verdict metadata and separate comparator logic into a pluggable interface.

### Context
The execution service must run untrusted user code in isolated containers, capture the output, and compare it to trusted expected results.  
Competitive programming-style judging requires normalization rules for whitespace and optional floating-point tolerances.  
Verdicts must be reproducible, explainable, and consistent across runs.

An ideal approach would:
- Capture output reliably without risk of unbounded memory use.
- Enforce time, memory, and output size limits deterministically.
- Normalize outputs according to standard competitive programming practices.
- Provide mismatch details for debugging.
- Support future extension to custom comparators.

### Problem to solve
Design a method to capture, store, and compare execution results securely and efficiently, producing standardized verdicts.

### Options

#### Option 1 — File-based capture only
Run container, write stdout/stderr to files, read after execution.
- Predictable read, but no early stop for output overflow.

#### Option 2 — Streaming capture only
Attach to stdout/stderr via Docker API, process output in real time.
- Early detection of output overflow, but must store temp files for debugging.

#### Option 3 — Hybrid capture (selected)
Stream output for limit enforcement and write to temp files for post-run inspection.

### Selected option
**Option 3 (Hybrid capture)**:
- Attach to container stdout/stderr via Docker API stream.
- Apply real-time output size limit — terminate on overflow.
- Store stdout in ephemeral host file for comparison; store stderr separately for logs.
- Apply container-level CPU/memory limits for enforcement.
- Perform Codeforces-style normalized comparison by default.
- Optional floating-point tolerance mode for designated problems.
- Comparator implemented via pluggable `Comparator` interface.

### Reasoning
- Streaming capture prevents runaway memory usage.
- Temp file storage enables debugging and reproducibility.
- Codeforces-style normalization matches expected competitive programming behavior while keeping implementation deterministic.
- Pluggable comparator design allows future custom comparator integration without touching runner core.

### Risks
1. **Output truncation ambiguity** — contestants might be confused if output is cut mid-run.
2. **Race conditions in stream handling** — possible to miss trailing bytes if container exits unexpectedly.
3. **Performance bottleneck** — comparator could be slow for very large outputs.
4. **Memory spikes** — if streaming buffer size is misconfigured.

### Mandatory mitigations
- Clearly report “Output Limit Exceeded” when truncation occurs; do not silently cut.
- Use buffered streaming with explicit flush on container exit.
- Set comparator to operate in chunked mode for large files.
- Enforce strict time/memory/output size limits and terminate immediately on breach.
- Maintain separate stdout and stderr captures; stderr excluded from comparison but stored for logs.
- Securely delete temp files after verdict computation to prevent disk leakage.

### Tests & validation
- **Unit tests** for:
  - Streaming capture limit enforcement.
  - Comparator normalization rules (trailing spaces/newlines handling).
  - Floating-point tolerance logic.
- **Integration tests**:
  - Time limit exceeded case.
  - Memory limit exceeded case.
  - Output limit exceeded case.
  - Wrong answer with mismatch at various points.
  - Correct answer with trailing newline differences.
- **Adversarial tests**:
  - Contestant tries to flood output to trigger overflow.
  - Contestant prints hidden expected output to guess test cases.

### Acceptance criteria
- [ ] Streaming capture implemented with early stop on output overflow.
- [ ] Stdout and stderr stored separately in ephemeral location.
- [ ] Container-level time/memory limits enforced.
- [ ] Default comparator implements Codeforces normalization.
- [ ] Optional floating-point tolerance mode available.
- [ ] Comparator wrapped in `Comparator` interface.
- [ ] Temp files securely deleted after verdict computation.
- [ ] All unit, integration, and adversarial tests pass.

### Future-proofing
- Comparator interface supports:
  - `exact`
  - `normalized`
  - `float_tolerance`
  - `custom_script`
- Allow optional persistence of stderr/stdout for post-contest debugging.
- Potential to run comparator in a separate isolated process for very large outputs.
