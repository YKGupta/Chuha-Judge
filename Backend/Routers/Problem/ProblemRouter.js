import express from 'express';
import ValidateToken from '../../Middleware/User/UserValidate.js';
import UserAdmin from '../../Middleware/User/UserAdmin.js';
import { Add, Get } from '../../Controllers/Problem/ProblemController.js';

const ProblemRouter = express.Router();

ProblemRouter.get('/get/:code', Get);

ProblemRouter.post('/add', ValidateToken, UserAdmin, Add);

export default ProblemRouter;