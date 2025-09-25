import { AuthService } from './auth.service';
import { IUserRepository } from '@modules/user/interfaces/user.repository';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { IUser, RoleEnum } from '@modules/user/user.entity';
import jwt from 'jsonwebtoken';
import { comparePasswords } from '@utils/passwordHash';

jest.mock('@utils/passwordHash', () => ({
  comparePasswords: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let repositoryMock: jest.Mocked<IUserRepository>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;

  beforeEach(() => {
    repositoryMock = {
      findByEmailWithIndex: jest.fn(),
    } as any;

    errorHandlerMock = {
      unauthorizedException: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
      internalServerErrorException: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
    } as any;

    service = new AuthService(repositoryMock, errorHandlerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    const user: IUser = {
      id: 'u1',
      name: 'test',
      email: 'test@test.com',
      password: 'hashedpassword',
      role: RoleEnum.ADMIN,
      createdAt: '',
    };

    it('should return user if email and password are correct', () => {
      repositoryMock.findByEmailWithIndex.mockReturnValue({ user, index: 0 });
      (comparePasswords as jest.Mock).mockReturnValue(true);

      const result = service.validateUser(user.email, 'password');
      expect(result).toEqual(user);
    });

    it('should throw unauthorized if user not found', () => {
      repositoryMock.findByEmailWithIndex.mockReturnValue({ user: undefined, index: -1 });

      expect(() => service.validateUser('invalid@test.com', 'password')).toThrow('Invalid credentials');
    });

    it('should throw unauthorized if password is invalid', () => {
      repositoryMock.findByEmailWithIndex.mockReturnValue({ user, index: 0 });
      (comparePasswords as jest.Mock).mockReturnValue(false);

      expect(() => service.validateUser(user.email, 'wrongpassword')).toThrow('Invalid credentials');
    });
  });

  describe('generateToken', () => {
    const user: IUser = {
      id: 'u1',
      name: 'test',
      email: 'test@test.com',
      password: 'hashedpassword',
      role: RoleEnum.ADMIN,
      createdAt: '',
    };

    beforeAll(() => {
      process.env.JWT_SECRET = 'secret';
      process.env.JWT_EXPIRES_IN = '1h';
    });

    it('should return a JWT token string', () => {
      const token = service.generateToken(user);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      expect(decoded).toMatchObject({ id: user.id, email: user.email, role: user.role });
    });

    it('should fallback to "1h" if JWT_EXPIRES_IN is not set', () => {
      delete process.env.JWT_EXPIRES_IN;

      const token = service.generateToken(user);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      expect(decoded).toMatchObject({ id: user.id, email: user.email, role: user.role });
    });

    it('should call internalServerErrorException if jwt.sign fails', () => {
      jest.spyOn(jwt, 'sign').mockImplementation(() => {
        throw new Error('fail');
      });

      expect(() => service.generateToken(user)).toThrow('Failed to generate token');
    });
  });
});
