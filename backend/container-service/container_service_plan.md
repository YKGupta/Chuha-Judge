# Container Service (Minimal Runner) - Implementation Plan

## Goal
Build a minimal, standalone Container Service that:
- Accepts code execution requests via HTTP POST (`/execute`).
- Runs the code in a Docker container with resource limits.
- Captures stdout, stderr, execution time, and memory usage.
- Compares output with expected results (Codeforces-style).
- Returns `{ verdict, executionTime, memoryUsed }` as response.

---

## Step 1: Project Setup
- Create a new folder: `container-service/`
- Initialize Node.js project:
  ```bash
  mkdir container-service && cd container-service
  npm init -y
  npm install express body-parser dockerode
  ```
- Ensure Docker is installed and running locally.

---

## Step 2: Directory Structure
```
container-service/
├── src/
│   ├── app.js              # Express server entry
│   ├── routes.js           # API routes
│   ├── runner.js           # Docker execution logic
│   ├── comparator.js       # Output comparison logic
│   ├── problems/           # Problem test cases
│   │   └── <problemID>/
│   │       ├── input.txt
│   │       └── output.txt
├── package.json
```

---

## Step 3: API Endpoints
### POST `/execute`
**Request Body:**
```json
{
  "code": "<source_code_here>",
  "language": "cpp",
  "problemID": "123"
}
```
**Response:**
```json
{
  "verdict": "Accepted",
  "executionTime": 123,
  "memoryUsed": 1024
}
```

---

## Step 4: Runner Logic (runner.js)
1. **Save Code to Temp File**:
   - Create a working directory for the request.
2. **Select Docker Image**:
   - Example mapping:
     ```js
     const images = { cpp: "gcc:latest", python: "python:3.10" };
     ```
3. **Run Container with Limits**:
   - CPU limit
   - Memory limit
   - Time limit (kill container if exceeded)
4. **Inject Code and Input Files**:
   - Mount problem's `input.txt` into the container.
5. **Capture Execution Stats**:
   - stdout, stderr
   - Execution time (measure start-end)
   - Memory usage (`docker stats` or cgroup file read)

---

## Step 5: Output Comparison (comparator.js)
- Load `output.txt` for the problem.
- Compare with actual stdout using **Codeforces rules**:
  - Ignore trailing spaces/newlines.
  - Normalize line endings.

---

## Step 6: Response
- If output matches → `"Accepted"`
- If mismatch → `"Wrong Answer"`
- If exceeded limits → `"Time Limit Exceeded"` / `"Memory Limit Exceeded"`
- If compilation/runtime error → `"Compilation Error"` / `"Runtime Error"`

---

## Step 7: Testing
1. Create a sample problem in `problems/1/` with `input.txt` and `output.txt`.
2. Send sample POST request to `/execute`.
3. Verify container runs, produces output, returns verdict.

---

## Step 8: Future Enhancements
- Connect to submission queue.
- Persistent logging of executions.
- Multiple test cases per problem.
- Language auto-detection.

---

**Next Step:** Implement `runner.js` to handle Docker execution.
