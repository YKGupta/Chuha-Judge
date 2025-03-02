import { Router } from 'express';
import { RegisterHandler } from '../../controllers/User/index.controller';

const UserRouter = Router();

UserRouter.post('/register', RegisterHandler);

export default UserRouter;