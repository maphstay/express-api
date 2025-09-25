import { UserController } from '@modules/user/user.controller';
import { Router } from 'express';
import { UserRepository } from '@modules/user/user.repository';
import { UserService } from '@modules/user/user.service';
import { ErrorHandlingService } from '@errors/errorHandling.service';
import { validateRouteParams } from '@middlewares/params.middleware';
import { authenticateJWT } from '@middlewares/authentication.middleware';
import { authorize } from '@middlewares/authorization.middleware';
import { RoleEnum } from '@modules/user/user.entity';

const router = Router();

const userRepository = new UserRepository();
const errorHandlingService = new ErrorHandlingService();
const userService = new UserService(userRepository, errorHandlingService);
const userController = new UserController(userService, errorHandlingService);

router.post('/', userController.create);
router.get(
  '/',
  authenticateJWT,
  authorize([RoleEnum.ADMIN]),
  validateRouteParams(['page', 'limit']),
  userController.getPaginated,
);
router.get('/:id', authenticateJWT, authorize([RoleEnum.ADMIN]), validateRouteParams(['id']), userController.get);
router.patch('/:id', authenticateJWT, authorize([RoleEnum.ADMIN]), validateRouteParams(['id']), userController.update);
router.delete('/:id', validateRouteParams(['id']), userController.delete);

export default router;
