import { Router } from "express";
import AuthMiddleware from "../../middlewares/Auth";
import { CreateSubmission, GetSubmissions } from "../../controllers/Submissions/index.controller.js";

const SubmissionsRouter = Router();

SubmissionsRouter.get('/', AuthMiddleware, GetSubmissions);
SubmissionsRouter.post('/', AuthMiddleware, CreateSubmission);

export default SubmissionsRouter;