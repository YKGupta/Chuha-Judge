import rateLimit from 'express-rate-limit';

const RegisterRequestLimiter = rateLimit({
    windowMs: process.env.REGISTER_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const LoginRequestLimiter = rateLimit({
    windowMs: process.env.LOGIN_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const RefreshRequestLimiter = rateLimit({
    windowMs: process.env.REFRESH_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const ProfileRequestLimiter = rateLimit({
    windowMs: process.env.PROFILE_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

export { RegisterRequestLimiter, LoginRequestLimiter, RefreshRequestLimiter, ProfileRequestLimiter };