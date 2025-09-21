import { Request, Response, NextFunction } from 'express';
import { ITopicController } from './interfaces/topic.controller';
import { ITopicService } from './interfaces/topic.service';
import { ErrorHandlingService } from '@errors/errorHandling.service';

export class TopicController implements ITopicController {
  constructor(
    private service: ITopicService,
    private errorHandler: ErrorHandlingService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, content, parentTopicId } = req.body;
      if (!name)
        return this.errorHandler.badRequestException('name required', {
          serviceName: TopicController.name,
          serviceMethod: 'create',
        });
      if (!content)
        return this.errorHandler.badRequestException('content required', {
          serviceName: TopicController.name,
          serviceMethod: 'create',
        });

      const topic = this.service.createTopic({ name, content, parentTopicId });
      return res.status(201).json(topic);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, content, parentTopicId } = req.body;
      const topic = this.service.updateTopic(id, { name, content, parentTopicId });
      return res.json(topic);
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const version = req.query.version ? Number(req.query.version) : undefined;
      const topic = this.service.getTopic(id, version);
      return res.json(topic);
    } catch (err) {
      next(err);
    }
  };

  getPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = this.service.getTopicsPaginated(page, limit);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = this.service.deleteTopic(id);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  shortestPath = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query;
      if (!from || !to)
        return this.errorHandler.badRequestException('from and to required', {
          serviceName: TopicController.name,
          serviceMethod: 'shortestPath',
        });

      const path = this.service.shortestPath(String(from), String(to));
      return res.json({ path });
    } catch (err) {
      next(err);
    }
  };

  listVersions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const versions = this.service.listVersions(id);
      return res.json(versions);
    } catch (err) {
      next(err);
    }
  };
}
