import { Router } from 'express';
import { SubmitHandler } from '../../controllers/Runner/index.controller.js';
import { SubmitRequestLimiter } from '../../rateLimiters/Runner/index.js';

const RunnerRouter = Router();

RunnerRouter.post('/submit', SubmitRequestLimiter, SubmitHandler);

export default RunnerRouter;