import { TopicController } from '@modules/topic/topic.controller';
import { requireRole } from '@middlewares/auth.middleware';
import { Router } from 'express';
import { TopicRepository } from '@modules/topic/topic.repository';
import { TopicService } from '@modules/topic/topic.service';
import { ErrorHandlingService } from '@errors/errorHandling.service';

const router = Router();

const topicRepository = new TopicRepository();
const errorHandlingService = new ErrorHandlingService();
const topicService = new TopicService(topicRepository, errorHandlingService);
const topicController = new TopicController(topicService, errorHandlingService);

router.post('/', topicController.create);
router.get('/', topicController.getPaginated);
router.get('/:id', topicController.get);
router.put('/:id', topicController.update);
router.delete('/:id', topicController.delete);
router.get('/:id/versions', topicController.listVersions);
router.get('/shortest/path', topicController.shortestPath);

// router.post('/', requireRole(['Admin', 'Editor']), TopicController.create);
// router.put('/:id', requireRole(['Admin', 'Editor']), TopicController.update);
// router.get('/:id', requireRole(['Admin', 'Editor', 'Viewer']), TopicController.get);
// router.delete('/:id', requireRole(['Admin']), TopicController.delete);

// // extras
// router.get('/:id/tree', requireRole(['Admin', 'Editor', 'Viewer']), TopicController.tree);
// router.get('/:id/versions', requireRole(['Admin', 'Editor', 'Viewer']), TopicController.listVersions);

// // shortest path query params? provide as /shortest?from=...&to=...
// router.get('/shortest/path', requireRole(['Admin', 'Editor', 'Viewer']), TopicController.shortestPath);

export default router;
