import { Router } from "express";
import {
    LoginHandler,
    LogoutHandler,
    ProfileHandler,
    RefreshHandler,
    RegisterHandler,
    VerificationHandler,
    GoogleCallbackHandler,
    GoogleRedirectHandler,
    GithubRedirectHandler,
    GithubCallbackHandler,
} from "../controllers/user.controller.js";
import {
    LoginRequestLimiter,
    ProfileRequestLimiter,
    RefreshRequestLimiter,
    RegisterRequestLimiter,
} from "../rateLimiters/user.rateLimiter.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const UserRouter = Router();

UserRouter.post("/register", RegisterRequestLimiter, RegisterHandler);
UserRouter.get("/verify-email", RegisterRequestLimiter, VerificationHandler);
UserRouter.post("/login", LoginRequestLimiter, LoginHandler);
UserRouter.post("/refresh-token", RefreshRequestLimiter, RefreshHandler);
UserRouter.get(
    "/profile",
    ProfileRequestLimiter,
    AuthMiddleware,
    ProfileHandler
);
UserRouter.post("/logout", LogoutHandler);
UserRouter.get("/oauth/github", GithubRedirectHandler);
UserRouter.get("/oauth/github/callback", GithubCallbackHandler);
UserRouter.get("/oauth/google", GoogleRedirectHandler);
UserRouter.get("/oauth/google/callback", GoogleCallbackHandler);

export default UserRouter;
