import { Router } from 'express';
import { LoginHandler, LogoutHandler, ProfileHandler, RefreshHandler, RegisterHandler, VerificationHandler } from '../../controllers/User/index.controller.js';
import { LoginRequestLimiter, ProfileRequestLimiter, RefreshRequestLimiter, RegisterRequestLimiter } from '../../rateLimiters/User/index.js';
import AuthMiddleware from '../../middlewares/Auth/index.js';

const UserRouter = Router();

UserRouter.post('/register', RegisterRequestLimiter, RegisterHandler);
UserRouter.get('/verify-email', RegisterRequestLimiter, VerificationHandler);
UserRouter.post('/login', LoginRequestLimiter, LoginHandler);
UserRouter.post('/refresh-token', RefreshRequestLimiter, RefreshHandler);
UserRouter.get('/profile', ProfileRequestLimiter, AuthMiddleware, ProfileHandler);
UserRouter.post('/logout', LogoutHandler);

export default UserRouter;