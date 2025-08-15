## Why reproducibility matters

Reproducibility is a non-negotiable requirement for any execution or judging system that runs untrusted code in a competitive or academic context. It means that the same code, run against the same problem, in the same environment, must always produce the same verdict.

### Reasons

1. **Fairness**  
   Ensures that identical submissions always produce identical verdicts. Without this, contestants can receive inconsistent results for the same solution, undermining trust in the system.

2. **Dispute resolution**  
   If a verdict is challenged, the system must be able to re-run the submission in the exact same environment to confirm or correct the result.

3. **Debugging**  
   Developers and problem setters can accurately diagnose unexpected verdicts by recreating the exact runtime conditions under which they occurred.

4. **Preventing environment drift**  
   Library updates, OS patches, or compiler changes can alter results. Reproducibility locks each run to its original environment, ensuring consistent behavior over time.

5. **Compliance and auditability**  
   In academic, professional, or regulated environments, reproducibility is necessary to demonstrate the integrity of results and defend against allegations of bias or error.

6. **Trust in the platform**  
   A reproducible judge is predictable and transparent. Contestants and stakeholders can rely on it to be stable and impartial.

### Implementation implications
- All container images must be versioned and immutable once used in production.
- Test cases must be version-controlled and linked to specific runs.
- Execution limits (time, memory, output) must be recorded per run.
- Any rejudging must use the exact same image, test case version, and limits as the original run.
