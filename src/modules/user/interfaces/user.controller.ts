import { Request, Response, NextFunction } from 'express';

export abstract class IUserController {
  abstract create(req: Request, res: Response, next: NextFunction): void;
  abstract update(req: Request, res: Response, next: NextFunction): void;
  abstract get(req: Request, res: Response, next: NextFunction): void;
  abstract getPaginated(req: Request, res: Response, next: NextFunction): void;
  abstract delete(req: Request, res: Response, next: NextFunction): void;
}
