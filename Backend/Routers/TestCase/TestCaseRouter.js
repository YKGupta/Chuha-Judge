import express from 'express';
import ValidateToken from '../../Middleware/User/UserValidate.js';
import UserAdmin from '../../Middleware/User/UserAdmin.js';
import { Add, Get } from '../../Controllers/TestCase/TestCaseController.js';

const TestCaseRouter = express.Router();

TestCaseRouter.get('/:problemCode', ValidateToken, UserAdmin, Get);

TestCaseRouter.post('/add', ValidateToken, UserAdmin, Add);

export default TestCaseRouter;