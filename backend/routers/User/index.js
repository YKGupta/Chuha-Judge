import { Router } from 'express';
import { LoginHandler, RegisterHandler, VerificationHandler } from '../../controllers/User/index.controller.js';
import { LoginRequestLimiter, RegisterRequestLimiter } from '../../rateLimiters/User/index.js';

const UserRouter = Router();

UserRouter.post('/register', RegisterRequestLimiter, RegisterHandler);
UserRouter.get('/verify-email', RegisterRequestLimiter, VerificationHandler);
UserRouter.post('/login', LoginRequestLimiter, LoginHandler);

export default UserRouter;