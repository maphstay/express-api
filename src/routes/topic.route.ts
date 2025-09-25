import { TopicController } from '@modules/topic/topic.controller';
import { Router } from 'express';
import { TopicRepository } from '@modules/topic/topic.repository';
import { TopicService } from '@modules/topic/topic.service';
import { ErrorHandlingService } from '@errors/errorHandling.service';
import { ResourceRepository } from '@modules/resource/resource.repository';
import { validateRouteParams } from '@middlewares/params.middleware';
import { authenticateJWT } from '@middlewares/authentication.middleware';
import { authorize } from '@middlewares/authorization.middleware';
import { RoleEnum } from '@modules/user/user.entity';

const router = Router();

const topicRepository = new TopicRepository();
const resourceRepository = new ResourceRepository();
const errorHandlingService = new ErrorHandlingService();
const topicService = new TopicService(topicRepository, resourceRepository, errorHandlingService);
const topicController = new TopicController(topicService, errorHandlingService);

router.post('/', authenticateJWT, authorize([RoleEnum.ADMIN, RoleEnum.EDITOR]), topicController.create);
router.get(
  '/',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR, RoleEnum.VIEWER]),
  validateRouteParams(['page', 'limit']),
  topicController.getPaginated,
);
router.get(
  '/:id',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR, RoleEnum.VIEWER]),
  validateRouteParams(['id']),
  topicController.get,
);
router.put(
  '/:id',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR]),
  validateRouteParams(['id']),
  topicController.update,
);
router.delete(
  '/:id',
  authenticateJWT,
  authorize([RoleEnum.ADMIN]),
  validateRouteParams(['id']),
  topicController.delete,
);
router.get(
  '/:id/versions',
  authenticateJWT,
  authorize([RoleEnum.ADMIN, RoleEnum.EDITOR, RoleEnum.VIEWER]),
  validateRouteParams(['id']),
  topicController.listVersions,
);
router.get('/shortest/path', authenticateJWT, topicController.shortestPath);

export default router;
