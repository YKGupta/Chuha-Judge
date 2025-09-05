# Plan (short)

1. `backend/` — Express API `POST /submit` accepts `{ code, language, input, expectedOutput }`, forwards job to container-service, compares output, returns verdict.
2. `container-service/` — Express API `POST /run` accepts `{ code, language, input }`, creates a container (Python), copies files into it using a tar stream (`putArchive`), runs it, captures `stdout`, `stderr`, `exitCode`, removes container, returns result.
3. `docker-compose.yml` brings both up. `container-service` is **not** published to host, only `backend` is (so container-service stays internal).
4. Test: `curl` a Hello World submission to backend and expect `AC`.

---

# Why this approach (quick)

* Using `container.putArchive()` avoids bind-mount issues and host-path confusion when the container-service itself runs inside Docker.
* `container-service` will need access to the host Docker daemon — we give it `/var/run/docker.sock` (common for MVP). **Security caveat:** mounting the Docker socket is powerful: any code that reaches the container-service could control Docker. For MVP OK, but lock this down before prod.

---

# Files to create

I’ll provide minimal `package.json`, `index.js`, `Dockerfile` for both services and `docker-compose.yml`.

---

## 1) `backend/`

**`backend/package.json`**

```json
{
  "name": "oj-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "axios": "^1.4.0",
    "express": "^4.18.2"
  }
}
```

**`backend/index.js`**

```js
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const CONTAINER_SERVICE_URL = process.env.CONTAINER_SERVICE_URL || 'http://container-service:3001/run';

function normalize(s) {
  if (!s) return '';
  return s.replace(/\r\n/g, '\n').trim();
}

app.post('/submit', async (req, res) => {
  try {
    const { code, language, input = '', expectedOutput = '' } = req.body;
    if (!code || !language) return res.status(400).json({ error: 'code and language are required' });

    // forward job to container-service
    const r = await axios.post(CONTAINER_SERVICE_URL, { code, language, input }, { timeout: 20000 });
    const { stdout, stderr, exitCode } = r.data;

    // simple comparator (trim + normalize newlines)
    const verdict = (exitCode !== 0)
      ? 'RE'
      : (normalize(stdout) === normalize(expectedOutput) ? 'AC' : 'WA');

    res.json({ verdict, stdout, stderr, exitCode });
  } catch (err) {
    console.error('backend error', err?.response?.data || err.message);
    res.status(500).json({ error: err.message, details: err?.response?.data });
  }
});

app.listen(3000, () => console.log('backend listening on 3000'));
```

**`backend/Dockerfile`**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

---

## 2) `container-service/`

We’ll use: `dockerode`, `tar-stream`, `express`, `uuid` (for job id).

**`container-service/package.json`**

```json
{
  "name": "container-service",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "express": "^4.18.2",
    "dockerode": "^3.3.0",
    "tar-stream": "^2.2.0",
    "uuid": "^9.0.0"
  }
}
```

**`container-service/index.js`**

```js
const express = require('express');
const Docker = require('dockerode');
const tar = require('tar-stream');
const stream = require('stream');
const { v4: uuidv4 } = require('uuid');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/run', async (req, res) => {
  try {
    const { code, language = 'python', input = '' } = req.body;
    if (!code) return res.status(400).json({ error: 'code required' });
    if (language !== 'python') return res.status(400).json({ error: 'only "python" supported in MVP' });

    const jobId = uuidv4();
    const image = 'python:3.11-slim';

    // create container (we'll copy files into /workspace)
    const container = await docker.createContainer({
      Image: image,
      Cmd: ['/bin/sh', '-lc', 'python /workspace/main.py < /workspace/input.txt'],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      WorkingDir: '/workspace'
    });

    // create a tar pack with main.py and input.txt
    const pack = tar.pack();
    pack.entry({ name: 'main.py' }, code);
    pack.entry({ name: 'input.txt' }, input);
    pack.finalize();

    // copy into container at /workspace
    await container.putArchive(pack, { path: '/workspace' });

    // start container
    await container.start();

    // wait for it to finish
    const waitData = await container.wait();
    const exitCode = waitData.StatusCode;

    // get logs (may be Buffer or Stream)
    const rawLogs = await container.logs({ stdout: true, stderr: true, follow: false });

    let stdout = '', stderr = '';
    const demuxAndCollect = async (logs) => {
      const outStream = new stream.PassThrough();
      const errStream = new stream.PassThrough();
      outStream.on('data', c => stdout += c.toString());
      errStream.on('data', c => stderr += c.toString());

      if (Buffer.isBuffer(logs)) {
        const bufStream = new stream.PassThrough();
        bufStream.end(logs);
        docker.modem.demuxStream(bufStream, outStream, errStream);
      } else {
        docker.modem.demuxStream(logs, outStream, errStream);
      }

      // small delay to flush streams
      await new Promise(r => setTimeout(r, 50));
    };

    await demuxAndCollect(rawLogs);

    // cleanup
    try { await container.remove({ force: true }); } catch (e) { console.warn('remove failed', e.message); }

    res.json({ stdout, stderr, exitCode });
  } catch (err) {
    console.error('container-service error', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('container-service listening on 3001'));
```

**`container-service/Dockerfile`**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

---

## 3) `docker-compose.yml` (root)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - container-service
    networks:
      - app-network

  container-service:
    build: ./container-service
    expose:
      - "3001"
    # give access to host docker daemon (MVP). Be aware: security risk.
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## 4) `.dockerignore` (both services)

```
node_modules
npm-debug.log
.DS_Store
```

Place one `.dockerignore` in each service folder.

---

# How to test (Hello World)

1. From project root:

```bash
docker-compose up --build
```

2. Submit a Hello World job (example using `curl`):

```bash
curl -s -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{
    "language":"python",
    "code":"print(\"Hello World\")",
    "input":"",
    "expectedOutput":"Hello World"
  }' | jq
```

Expected response (JSON):

```json
{
  "verdict":"AC",
  "stdout":"Hello World\n",
  "stderr":"",
  "exitCode":0
}
```

If `jq` not installed you'll still see raw JSON.

---

# Notes, pitfalls & troubleshooting

* **Docker socket permission**: On Linux, make sure your Docker user can read `/var/run/docker.sock`. On some setups you might need to run `docker-compose` as your user in the `docker` group.
* **Container images**: Docker will pull `python:3.11-slim`. If image pull fails, check host connectivity.
* **Multiplexed logs**: Docker returns multiplexed stdout/stderr. I used `docker.modem.demuxStream` which handles it. If you get weird binary output, check `tty` flags (we set `Tty:false`).
* **Timeouts / infinite loops**: There is no hard timeout in the simple code above. If you want a quick guard, add `setTimeout` + `container.kill()` at a chosen threshold (e.g., 5–10s). For MVP you can skip, but be aware infinite loops will block container run.
* **Windows / Docker Desktop**: `/var/run/docker.sock` is UNIX-specific. On Windows, mapping the socket works with WSL2/Docker Desktop, but if issues appear you can run all services on a Linux-based dev machine or use Docker remote TCP. (If you need help adapting to Windows, paste your environment and I’ll guide.)
* **Only Python supported**: container-service currently rejects languages other than `python`. To add Node.js later: create `main.js` instead and run `node /workspace/main.js`. I can show that when you want to extend.

---

# Next steps I suggest (after you get MVP working)

1. Add a short run timeout (5–10s) to avoid infinite loops.
2. Add request size limits and basic input validation.
3. Add a small job ID and logs directory for debugging.
4. Add basic logging and health check endpoints.
