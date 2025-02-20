import express from 'express';
import { Get, Login, Signup } from '../../Controllers/User/UserController.js';
import ValidateToken from '../../Middleware/User/UserValidate.js';

const UserRouter = express.Router();

UserRouter.post('/signup', Signup);

UserRouter.post('/login', Login);

UserRouter.get('/get', ValidateToken, Get);

export default UserRouter;