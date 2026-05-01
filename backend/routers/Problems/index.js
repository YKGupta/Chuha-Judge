import { Router } from "express";
import { GetProblemsHandler, GetProblemHandler, CreateProblemHandler, UpdateProblemHandler, DeleteProblemHandler } from "../../controllers/Problems/index.controller.js";
import { CreateTestcaseHandler, GetTestcasesForProblemHandler } from "../../controllers/Testcases/index.controller.js";
import AuthMiddleware from '../../middlewares/Auth/index.js';
import AdminMiddleware from "../../middlewares/Admin/index.js";

const ProblemsRouter = Router();

ProblemsRouter.get('/', GetProblemsHandler);
ProblemsRouter.get('/:slug', GetProblemHandler);
ProblemsRouter.get('/:slug/testcases', AuthMiddleware, AdminMiddleware, GetTestcasesForProblemHandler);
ProblemsRouter.post('/:slug/testcases', AuthMiddleware, AdminMiddleware, CreateTestcaseHandler);
ProblemsRouter.post('/', AuthMiddleware, AdminMiddleware, CreateProblemHandler);
ProblemsRouter.patch('/:slug', AuthMiddleware, AdminMiddleware, UpdateProblemHandler);
ProblemsRouter.delete('/:slug', AuthMiddleware, AdminMiddleware, DeleteProblemHandler);

export default ProblemsRouter;