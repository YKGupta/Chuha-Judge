import { Router } from 'express';

const RunnerRouter = Router();

function normalize(s) {
    if (!s) return '';
    return s.replace(/\r\n/g, '\n').trim();
}

RunnerRouter.post('/submit', async (req, res) => {
    try {
        const { code, language, input = '', expectedOutput = '' } = req.body;
        if (!code || !language) return res.status(400).json({ error: 'code and language are required' });

        // forward job to container-service
        const r = await fetch(CONTAINER_SERVICE_URL, {
            method: "POST",
            body: JSON.stringify({ code, language, input }),
            headers: { 'Content-Type': 'application/json' }
        });
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

export default RunnerRouter;