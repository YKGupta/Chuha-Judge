import { rateLimit } from 'express-rate-limit';

const isDev = process.env.NODE_ENV === "development";

const ONE_MINUTE = 60 * 1000;

const NoOpMiddleware = (req, res, next) => next();

const CreateSubmissionRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: ONE_MINUTE,
    max: Number.parseInt(process.env.CREATE_SUBMISSION_MAX_PER_MINUTE),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.userId || req.ip,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

export { CreateSubmissionRequestLimiter };