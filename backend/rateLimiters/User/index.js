import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === "development";

const ONE_MINUTE = 60 * 1000;

const NoOpMiddleware = (req, res, next) => next();

const RegisterRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: ONE_MINUTE,
    max: Number.parseInt(process.env.REGISTER_REQUEST_MAX_PER_MINUTE),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const LoginRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: ONE_MINUTE,
    max: Number.parseInt(process.env.LOGIN_REQUEST_MAX_PER_MINUTE),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const RefreshRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: ONE_MINUTE,
    max: Number.parseInt(process.env.REFRESH_REQUEST_MAX_PER_MINUTE),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const ProfileRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: ONE_MINUTE,
    max: Number.parseInt(process.env.PROFILE_REQUEST_MAX_PER_MINUTE),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

export { RegisterRequestLimiter, LoginRequestLimiter, RefreshRequestLimiter, ProfileRequestLimiter };