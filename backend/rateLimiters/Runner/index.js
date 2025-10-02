import rateLimit from 'express-rate-limit';

const SubmitRequestLimiter = rateLimit({
    windowMs: (process.env.SUBMIT_REQUEST_WINDOW_MS || 1000) * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

export { SubmitRequestLimiter };

