import { Router } from 'express';
import { LoginHandler, LogoutHandler, ProfileHandler, RefreshHandler, RegisterHandler, VerificationHandler, GoogleCallbackHandler, GoogleRedirectHandler } from '../../controllers/User/index.controller.js';
import { LoginRequestLimiter, ProfileRequestLimiter, RefreshRequestLimiter, RegisterRequestLimiter } from '../../rateLimiters/User/index.js';
import AuthMiddleware from '../../middlewares/Auth/index.js';

const UserRouter = Router();

UserRouter.post('/register', RegisterRequestLimiter, RegisterHandler);
UserRouter.get('/verify-email', RegisterRequestLimiter, VerificationHandler);
UserRouter.post('/login', LoginRequestLimiter, LoginHandler);
UserRouter.get('/refresh-token', RefreshRequestLimiter, RefreshHandler);
UserRouter.get('/profile', ProfileRequestLimiter, AuthMiddleware, ProfileHandler);
UserRouter.get('/logout', LogoutHandler);
UserRouter.get('/oauth/google', GoogleRedirectHandler);
UserRouter.get('/oauth/google/callback', GoogleCallbackHandler);

export default UserRouter;