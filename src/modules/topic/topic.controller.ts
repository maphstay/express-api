import { Request, Response, NextFunction } from 'express';
import { ITopicController } from './interfaces/topic.controller';
import { ITopicService } from './interfaces/topic.service';
import { CreateTopicDto } from './dto/createTopic.dto';
import { UpdateTopicDto } from './dto/updateTopic.dto';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';

export class TopicController implements ITopicController {
  constructor(
    private service: ITopicService,
    private errorHandler: IErrorHandlingService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateTopicDto.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map((e) => e.message).join(', ');
        return this.errorHandler.badRequestException(errorMessages, {
          serviceName: TopicController.name,
          serviceMethod: 'create',
        });
      }

      const topic = this.service.createTopic(parseResult.data);
      return res.status(201).json(topic);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parseResult = UpdateTopicDto.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map((e) => e.message).join(', ');
        return this.errorHandler.badRequestException(errorMessages, {
          serviceName: TopicController.name,
          serviceMethod: 'update',
        });
      }

      const topic = this.service.updateTopic(id, parseResult.data);
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
