const express = require('express');
const Docker = require('dockerode');
const tar = require('tar-stream');
const stream = require('stream');
const { v4: uuidv4 } = require('uuid');

const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/run', async (req, res) => {
    try {
        const { code, language = 'python', input = '' } = req.body;
        if (!code) return res.status(400).json({ error: 'code required' });
        if (language !== 'python') return res.status(400).json({ error: 'only "python" supported in MVP' });

        const jobId = uuidv4();
        const image = 'python:3.11-slim';

        console.log(`Starting container job ${jobId} with image ${image}`);

        // create container (we'll copy files into /workspace)
        const container = await docker.createContainer({
            Image: image,
            Cmd: ['/bin/sh', '-lc', 'python /workspace/main.py < /workspace/input.txt'],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            WorkingDir: '/workspace'
        });

        console.log(`Created container ${container.id} for job ${jobId}`);

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

app.listen(5000, () => console.log('container-service listening on 5000'));
