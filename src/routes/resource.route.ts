import { ResourceController } from '@modules/resource/resource.controller';
import { Router } from 'express';
import { ResourceRepository } from '@modules/resource/resource.repository';
import { ResourceService } from '@modules/resource/resource.service';
import { ErrorHandlingService } from '@errors/errorHandling.service';
import { TopicRepository } from '@modules/topic/topic.repository';
import { validateRouteParams } from '@middlewares/params.middleware';
import { authenticateJWT } from '@middlewares/authentication.middleware';
import { authorize } from '@middlewares/authorization.middleware';
import { RoleEnum } from '@modules/user/user.entity';

const router = Router();

const resourceRepository = new ResourceRepository();
const topicRepository = new TopicRepository();
const errorHandlingService = new ErrorHandlingService();
const resourceService = new ResourceService(resourceRepository, topicRepository, errorHandlingService);
const resourceController = new ResourceController(resourceService, errorHandlingService);

router.post(
  '/',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR, RoleEnum.VIEWER]),
  resourceController.create,
);
router.get(
  '/',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR, RoleEnum.VIEWER]),
  validateRouteParams(['page', 'limit']),
  resourceController.getPaginated,
);
router.get(
  '/:id',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR, RoleEnum.VIEWER]),
  validateRouteParams(['id']),
  resourceController.get,
);
router.patch(
  '/:id',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR]),
  validateRouteParams(['id']),
  resourceController.update,
);
router.delete(
  '/:id',
  authenticateJWT,
  authorize([RoleEnum.ADMIN]),
  validateRouteParams(['id']),
  resourceController.delete,
);

export default router;
