import express from 'express';
import dotenv from 'dotenv';
import UserRouter from './Routers/User/UserRouter.js';
import Connect from './Database/Connect.js';

dotenv.config();

Connect();

const PORT = process.env.PORT || 1234;
const HOST = process.env.HOST;

const app = express();

app.use(express.json());

app.use('/users', UserRouter);

app.listen(PORT, () => {
    console.log(`Backend service is listening on ${HOST}:${PORT}`);
});