import { Request, Response, NextFunction } from 'express';

export abstract class ITopicController {
  abstract create(req: Request, res: Response, next: NextFunction): void;
  abstract update(req: Request, res: Response, next: NextFunction): void;
  abstract get(req: Request, res: Response, next: NextFunction): void;
  abstract getPaginated(req: Request, res: Response, next: NextFunction): void;
  abstract delete(req: Request, res: Response, next: NextFunction): void;
  abstract shortestPath(req: Request, res: Response, next: NextFunction): void;
  abstract listVersions(req: Request, res: Response, next: NextFunction): void;
}
