import express from 'express';
import dotenv from 'dotenv';
import UserRouter from './Routers/User/UserRouter.js';
import Connect from './Database/Connect.js';
import ProblemRouter from './Routers/Problem/ProblemRouter.js';
import TestCaseRouter from './Routers/TestCase/TestCaseRouter.js';

dotenv.config();

Connect();

const PORT = process.env.PORT || 1234;
const HOST = process.env.HOST;

const app = express();

app.use(express.json());

app.use('/users', UserRouter);
app.use('/problems', ProblemRouter);
app.use('/testcases', TestCaseRouter);

app.listen(PORT, () => {
    console.log(`Backend service is listening on ${HOST}:${PORT}`);
});