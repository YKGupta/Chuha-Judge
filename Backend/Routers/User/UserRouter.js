import express from 'express';
import { Login, Signup } from '../../Controllers/User/UserController.js';

const UserRouter = express.Router();

UserRouter.post('/signup', Signup);

UserRouter.post('/login', Login);

export default UserRouter;