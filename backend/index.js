import 'dotenv/config';
import express from 'express';
import './database/connect.js';
import UserRouter from './routers/User/index.js';
import Logger from './middlewares/Logger/index.js';

const app = express();

app.set('trust proxy', 'loopback');
app.use(express.json());

app.use(Logger);

app.use('/api/auth', UserRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.HOST}:${process.env.PORT}`);
});