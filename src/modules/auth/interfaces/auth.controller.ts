import { Request, Response, NextFunction } from 'express';

export abstract class IAuthController {
  abstract login(req: Request, res: Response, next: NextFunction): void;
}
