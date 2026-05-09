import { Router } from "express";
import AuthMiddleware from "../../middlewares/Auth/index.js";
import { CreateSubmission, GetSubmissionById, GetSubmissions } from "../../controllers/Submissions/index.controller.js";
import { CreateSubmissionRequestLimiter } from "../../rateLimiters/Submissions/index.js";

const SubmissionsRouter = Router();

SubmissionsRouter.get('/', AuthMiddleware, GetSubmissions);
SubmissionsRouter.get('/:submissionId', AuthMiddleware, GetSubmissionById);
SubmissionsRouter.post('/', AuthMiddleware, CreateSubmissionRequestLimiter, CreateSubmission);

export default SubmissionsRouter;