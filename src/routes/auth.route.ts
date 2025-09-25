import { AuthController } from '@modules/auth/auth.controller';
import { Router } from 'express';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorHandlingService } from '@errors/errorHandling.service';
import { UserRepository } from '@modules/user/user.repository';

const router = Router();

const userRepository = new UserRepository();
const errorHandlingService = new ErrorHandlingService();
const authService = new AuthService(userRepository, errorHandlingService);
const authController = new AuthController(authService, errorHandlingService);

router.post('/login', authController.login);

export default router;
