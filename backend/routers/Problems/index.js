import { Router } from "express";
import { GetProblemsHandler, GetProblemHandler } from "../../controllers/Problems/index.controller.js";

const ProblemsRouter = Router();

ProblemsRouter.get('/', GetProblemsHandler);
ProblemsRouter.get('/:slug', GetProblemHandler);

export default ProblemsRouter;