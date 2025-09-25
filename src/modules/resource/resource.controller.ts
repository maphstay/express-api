import { Request, Response, NextFunction } from 'express';
import { IResourceController } from './interfaces/resource.controller';
import { IResourceService } from './interfaces/resource.service';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { CreateResourceDto } from './dto/createResource.dto';
import { UpdateResourceDto } from './dto/updateResource.dto';

export class ResourceController implements IResourceController {
  constructor(
    private service: IResourceService,
    private errorHandler: IErrorHandlingService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateResourceDto.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map((e) => e.message).join(', ');
        return this.errorHandler.badRequestException(errorMessages, {
          serviceName: ResourceController.name,
          serviceMethod: 'create',
        });
      }

      const resource = this.service.createResource(parseResult.data);
      return res.status(201).json(resource);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parseResult = UpdateResourceDto.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map((e) => e.message).join(', ');
        return this.errorHandler.badRequestException(errorMessages, {
          serviceName: ResourceController.name,
          serviceMethod: 'update',
        });
      }

      const updatedResource = this.service.updateResource(id, parseResult.data);
      return res.json(updatedResource);
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const resource = this.service.getResource(id);
      return res.json(resource);
    } catch (err) {
      next(err);
    }
  };

  getPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = this.service.getResourcesPaginated(page, limit);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = this.service.deleteResource(id);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
