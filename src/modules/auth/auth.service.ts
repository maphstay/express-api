import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { IUser } from '@modules/user/user.entity';
import { IUserRepository } from '@modules/user/interfaces/user.repository';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { IAuthService } from './interfaces/auth.service';
import { comparePasswords } from '@utils/passwordHash';

export class AuthService implements IAuthService {
  constructor(
    private repository: IUserRepository,
    private errorHandler: IErrorHandlingService,
  ) {}

  public validateUser(email: string, password: string): IUser {
    const { user } = this.repository.findByEmailWithIndex(email);

    if (!user) {
      return this.errorHandler.unauthorizedException(`Invalid credentials`, {
        serviceName: AuthService.name,
        serviceMethod: this.validateUser.name,
      });
    }

    const isPasswordValid = comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return this.errorHandler.unauthorizedException(`Invalid credentials`, {
        serviceName: AuthService.name,
        serviceMethod: this.validateUser.name,
      });
    }

    return user;
  }

  public generateToken(user: IUser): string {
    try {
      const payload = { id: user.id, email: user.email, role: user.role };
      const secret: Secret = process.env.JWT_SECRET!;

      const options: SignOptions = {
        expiresIn: ms((process.env.JWT_EXPIRES_IN as StringValue) || '1h'),
      };

      return jwt.sign(payload, secret, options);
    } catch (err) {
      return this.errorHandler.internalServerErrorException('Failed to generate token', {
        serviceName: AuthService.name,
        serviceMethod: this.generateToken.name,
      });
    }
  }
}
