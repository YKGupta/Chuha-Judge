import { Router } from "express";
import { GetProblemsHandler, GetProblemHandler, CreateProblemHandler, UpdateProblemHandler, DeleteProblemHandler } from "../controllers/problem.controller.js";
import { CreateTestcaseHandler, GetTestcasesForProblemHandler } from "../controllers/testcase.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import AdminMiddleware from "../middlewares/admin.middleware.js";

const ProblemsRouter = Router();

ProblemsRouter.get('/', GetProblemsHandler);
ProblemsRouter.get('/:slug', GetProblemHandler);
ProblemsRouter.get('/:slug/testcases', AuthMiddleware, AdminMiddleware, GetTestcasesForProblemHandler);
ProblemsRouter.post('/:slug/testcases', AuthMiddleware, AdminMiddleware, CreateTestcaseHandler);
ProblemsRouter.post('/', AuthMiddleware, AdminMiddleware, CreateProblemHandler);
ProblemsRouter.patch('/:slug', AuthMiddleware, AdminMiddleware, UpdateProblemHandler);
ProblemsRouter.delete('/:slug', AuthMiddleware, AdminMiddleware, DeleteProblemHandler);

export default ProblemsRouter;