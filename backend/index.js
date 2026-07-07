import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./database/connect.js";
import Logger from "./middlewares/logger.middleware.js";
import UserRouter from "./routers/user.router.js";
import ProblemsRouter from "./routers/problem.router.js";
import TestcasesRouter from "./routers/testcase.router.js";
import SubmissionsRouter from "./routers/submission.router.js";

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.set("trust proxy", "loopback");
app.use(express.json());
app.use(cookieParser());

app.use(Logger);

app.use("/api/auth", UserRouter);
app.use("/api/problems", ProblemsRouter);
app.use("/api/testcases", TestcasesRouter);
app.use("/api/submissions", SubmissionsRouter);

await connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.HOST}:${process.env.PORT}`);
});
