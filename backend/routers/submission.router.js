import { Router } from "express";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import { CreateSubmission, GetSubmissionById, GetSubmissions } from "../controllers/submission.controller.js";
import { CreateSubmissionRequestLimiter } from "../rateLimiters/submission.rateLimiter.js";

const SubmissionsRouter = Router();

SubmissionsRouter.get('/', AuthMiddleware, GetSubmissions);
SubmissionsRouter.get('/:submissionId', AuthMiddleware, GetSubmissionById);
SubmissionsRouter.post('/', AuthMiddleware, CreateSubmissionRequestLimiter, CreateSubmission);

export default SubmissionsRouter;