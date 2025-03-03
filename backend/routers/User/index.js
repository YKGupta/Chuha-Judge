import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { RegisterHandler, VerificationHandler } from '../../controllers/User/index.controller.js';

const UserRouter = Router();

const requestLimiter = rateLimit({
    windowMs: process.env.REGISTER_REQUEST_WINDOW_MS * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

UserRouter.post('/register', requestLimiter, RegisterHandler);
UserRouter.get('/verify-email', requestLimiter, VerificationHandler);

export default UserRouter;