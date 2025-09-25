import { Request, Response, NextFunction } from 'express';
import { AuthLoginDto } from './dto/auth.login.dto';
import { IAuthService } from './interfaces/auth.service';
import { IAuthController } from './interfaces/auth.controller';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';

export class AuthController implements IAuthController {
  constructor(
    private service: IAuthService,
    private errorHandler: IErrorHandlingService,
  ) {}

  login = (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = AuthLoginDto.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map((e) => e.message).join(', ');
        return this.errorHandler.badRequestException(errorMessages, {
          serviceName: AuthController.name,
          serviceMethod: 'login',
        });
      }

      const { email, password } = parseResult.data;
      const user = this.service.validateUser(email, password);
      const accessToken = this.service.generateToken(user);

      return res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
  };
}
