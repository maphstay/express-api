import { AuthController } from './auth.controller';
import { IAuthService } from './interfaces/auth.service';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { Request, Response, NextFunction } from 'express';
import { AuthLoginDto } from './dto/auth.login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let serviceMock: jest.Mocked<IAuthService>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    serviceMock = {
      validateUser: jest.fn(),
      generateToken: jest.fn(),
    } as any;

    errorHandlerMock = {
      badRequestException: jest.fn(),
    } as any;

    controller = new AuthController(serviceMock, errorHandlerMock);

    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 200 and accessToken when login succeeds', () => {
      const req = {
        body: { email: 'test@test.com', password: 'pass' },
      } as Request;

      const user = { id: 'u1', email: 'test@test.com', role: 'USER' } as any;
      serviceMock.validateUser.mockReturnValue(user);
      serviceMock.generateToken.mockReturnValue('token123');

      controller.login(req, res as Response, next);

      expect(serviceMock.validateUser).toHaveBeenCalledWith('test@test.com', 'pass');
      expect(serviceMock.generateToken).toHaveBeenCalledWith(user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ accessToken: 'token123' });
    });

    it('should call badRequestException if DTO is invalid', () => {
      const req = { body: { invalid: 'data' } } as any;
      const issues = [{ message: 'Invalid field' }];
      jest.spyOn(AuthLoginDto, 'safeParse').mockReturnValueOnce({ success: false, error: { issues } } as any);

      controller.login(req, res as Response, next);

      expect(errorHandlerMock.badRequestException).toHaveBeenCalledWith(
        'Invalid field',
        expect.objectContaining({
          serviceName: 'AuthController',
          serviceMethod: 'login',
        }),
      );
    });

    it('should call next if an exception occurs', () => {
      const req = {
        body: { email: 'test@test.com', password: 'pass' },
      } as Request;

      serviceMock.validateUser.mockImplementation(() => {
        throw new Error('fail');
      });

      controller.login(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
