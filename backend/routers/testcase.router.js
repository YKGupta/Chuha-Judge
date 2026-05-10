import { Router } from "express";
import {
    CreateTestcaseHandler,
    DeleteTestcaseHandler,
    GetTestcasesForProblemHandler,
    UpdateTestcaseHandler,
} from "../controllers/testcase.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import AdminMiddleware from "../middlewares/admin.middleware.js";

const TestcasesRouter = Router();

TestcasesRouter.patch(
    "/:testcaseId",
    AuthMiddleware,
    AdminMiddleware,
    UpdateTestcaseHandler
);
TestcasesRouter.delete(
    "/:testcaseId",
    AuthMiddleware,
    AdminMiddleware,
    DeleteTestcaseHandler
);

export default TestcasesRouter;
