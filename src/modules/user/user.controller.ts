import { Request, Response, NextFunction } from 'express';
import { IUserController } from './interfaces/user.controller';
import { IUserService } from './interfaces/user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';

export class UserController implements IUserController {
  constructor(
    private service: IUserService,
    private errorHandler: IErrorHandlingService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateUserDto.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map((e) => e.message).join(', ');
        return this.errorHandler.badRequestException(errorMessages, {
          serviceName: UserController.name,
          serviceMethod: 'create',
        });
      }

      const user = this.service.createUser(parseResult.data);
      return res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parseResult = UpdateUserDto.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map((e) => e.message).join(', ');
        return this.errorHandler.badRequestException(errorMessages, {
          serviceName: UserController.name,
          serviceMethod: 'update',
        });
      }

      const updatedUser = this.service.updateUser(id, parseResult.data);
      return res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = this.service.getUser(id);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  };

  getPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = this.service.getUsersPaginated(page, limit);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = this.service.deleteUser(id);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
