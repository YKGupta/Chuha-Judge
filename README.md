# 🧠 Online Judge (OJ) Platform

A secure, scalable, container-based **code execution and evaluation engine** designed to power interactive coding assessments, competitive programming platforms, and educational environments.

## 🚀 Vision

This project aims to become a **robust Online Judge engine** — the backend brain of a system that:

- Accepts code submissions from users across various programming languages
- Executes them securely in isolated environments (Docker)
- Evaluates them against test cases
- Returns output, error messages, and verdicts (pass/fail)
- Scales horizontally via container orchestration and queuing systems

## ✅ Current Capabilities

### 🔐 Authentication & Identity

- Email/password registration + login
- Secure JWT-based session management (Access + Refresh tokens)
- Email verification with rate-limited resend
- Google and GitHub OAuth integration
- Unified user model supporting both auth types

### 🛠 Online Judge Engine (In Progress)

- Asynchronous submission architecture (submit now, check result later)
- In-memory job queue (Redis to be added soon)
- Docker-based container pool for code execution
- Early API endpoints:
  - `POST /submissions` → receive code, enqueue job
  - `GET /submissions/:id` → check job status/result
  - `POST /execute` → container endpoint for running code

## 🔧 Tech Stack

| Layer             | Tech                      |
|------------------|---------------------------|
| Server/API       | Node.js / Express (or FastAPI if Python) |
| Auth             | JWT (access + refresh), OAuth (Google, GitHub) |
| Execution Engine | Docker containers          |
| Queue (current)  | In-memory (`Map`, `Deque`) |
| Queue (planned)  | Redis                      |
| Storage (future) | PostgreSQL or MongoDB      |
| Container API    | Minimal HTTP server (language runtimes) |

## 🤝 Contributing

We welcome contributors interested in:

- Distributed execution systems
- Secure sandboxing with Docker
- Queuing and worker infrastructure
- Code evaluation and grading logic

> To get started, check out [our main OJ Engine issue](To be updated) and its linked subissues.

## 📜 License

MIT – free to use and modify for learning and educational purposes.

---

## 🙌 Acknowledgements

Inspired by platforms like HackerRank, LeetCode, and Codeforces — but built from scratch to be modular, open, and extensible.
