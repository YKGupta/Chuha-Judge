import { Router } from "express";
import AuthMiddleware from "../../middlewares/Auth/index.js";
import { CreateSubmission, GetSubmissions } from "../../controllers/Submissions/index.controller.js";

const SubmissionsRouter = Router();

SubmissionsRouter.get('/', AuthMiddleware, GetSubmissions);
SubmissionsRouter.post('/', AuthMiddleware, CreateSubmission);

export default SubmissionsRouter;