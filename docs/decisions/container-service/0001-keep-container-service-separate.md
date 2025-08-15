## Summary statement
Use a separate microservice for the container runner to isolate execution workloads from the main backend API.

## Context
The current backend handles user authentication, business logic, and other API services.  
A new container runner will execute arbitrary code in Docker containers with specific resource limits.  
Running these two components together would couple unrelated concerns, increase deployment complexity, and introduce stability and security risks.

An ideal solution would:
- Allow independent scaling for API and execution workloads.
- Minimize the risk of code execution failures affecting API uptime.
- Support future integration with a queue system for asynchronous execution.
- Allow secure network and environment isolation between services.

## Problem to solve
We need to decide whether to integrate the container runner directly into the existing backend service or host it as a separate deployable service. This choice affects scalability, security, deployability, and maintainability in the long term.

## Options

### Option 1
**Host the container runner as a separate microservice with its own codebase, dependencies, deployment pipeline, and resource profile.**

### Option 2
Integrate the container runner into the existing backend codebase and expose it under a new route.

### Option 3
Host the container runner as a separate module within the backend repository but deploy it independently.

## Reasoning
Option 1 is selected because it provides the strongest separation of concerns and the most flexibility for scaling and deployment.  
By decoupling the runner from the API, we reduce the risk that execution workload failures (e.g., infinite loops, excessive memory usage) will impact API availability.  
This approach also enables independent scaling—runner instances can be increased or decreased based on execution load without affecting the API layer.  
In addition, a separate service allows for strict network and permission isolation, which is critical for securely executing untrusted code.  
Future enhancements such as queue-based execution and distributed deployment will be easier to implement when the runner is already separated from the main API.