import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === "development";

const NoOpMiddleware = (req, res, next) => next();

const RegisterRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: process.env.REGISTER_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const LoginRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: process.env.LOGIN_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const RefreshRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: process.env.REFRESH_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const ProfileRequestLimiter = isDev ? NoOpMiddleware : rateLimit({
    windowMs: process.env.PROFILE_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

export { RegisterRequestLimiter, LoginRequestLimiter, RefreshRequestLimiter, ProfileRequestLimiter };