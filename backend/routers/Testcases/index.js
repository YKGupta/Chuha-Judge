import { Router } from "express";
import { CreateTestcaseHandler, DeleteTestcaseHandler, GetTestcasesForProblemHandler, UpdateTestcaseHandler } from "../../controllers/Testcases/index.controller";
import AuthMiddleware from "../../middlewares/Auth/index.js";
import AdminMiddleware from "../../middlewares/Admin/index.js";

const TestcasesRouter = Router();

TestcasesRouter.get('/:problemId', AuthMiddleware, AdminMiddleware, GetTestcasesForProblemHandler);
TestcasesRouter.post('/:problemId', AuthMiddleware, AdminMiddleware, CreateTestcaseHandler);
TestcasesRouter.patch('/:testcaseId', AuthMiddleware, AdminMiddleware, UpdateTestcaseHandler);
TestcasesRouter.delete('/:testcaseId', AuthMiddleware, AdminMiddleware, DeleteTestcaseHandler);

export default TestcasesRouter;