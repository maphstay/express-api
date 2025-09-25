import { UserController } from './user.controller';
import { IUserService } from './interfaces/user.service';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { Request, Response, NextFunction } from 'express';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { RoleEnum } from './user.entity';

describe('UserController', () => {
  let controller: UserController;
  let serviceMock: jest.Mocked<IUserService>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    serviceMock = {
      createUser: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
      getUsersPaginated: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    errorHandlerMock = {
      badRequestException: jest.fn(),
      notFoundException: jest.fn(),
    } as any;

    controller = new UserController(serviceMock, errorHandlerMock);
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return 201 with created user', async () => {
      const req = {
        body: { email: 'test@test.com', name: 'Test', password: '12345678', role: RoleEnum.ADMIN },
      } as Request;
      const user = { id: 'u1', ...req.body };
      serviceMock.createUser.mockReturnValue(user);

      await controller.create(req, res as Response, next);

      expect(serviceMock.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should call badRequestException if DTO is invalid', async () => {
      const req = { body: { invalid: 'oops' } } as any;
      const issues = [{ message: 'Invalid field' }];
      jest.spyOn(CreateUserDto, 'safeParse').mockReturnValueOnce({ success: false, error: { issues } } as any);

      await controller.create(req, res as Response, next);

      expect(errorHandlerMock.badRequestException).toHaveBeenCalledWith('Invalid field', expect.any(Object));
    });

    it('should call next on exception', async () => {
      const req = {
        body: { email: 'test@test.com', name: 'Test', password: '12345678', role: RoleEnum.ADMIN },
      } as Request;
      serviceMock.createUser.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.create(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('update', () => {
    it('should return updated user', async () => {
      const req = { body: { name: 'Updated' }, params: { id: 'u1' } } as any;
      const updated = {
        id: 'u1',
        email: 'test@test.com',
        name: 'Updated',
        role: RoleEnum.ADMIN,
        password: '',
        createdAt: '',
      };
      serviceMock.updateUser.mockReturnValue(updated);

      await controller.update(req, res as Response, next);

      expect(serviceMock.updateUser).toHaveBeenCalledWith('u1', req.body);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('should call badRequestException if DTO invalid', async () => {
      const req = { body: { invalid: 'oops' }, params: { id: 'u1' } } as any;
      const issues = [{ message: 'Invalid field' }];
      jest.spyOn(UpdateUserDto, 'safeParse').mockReturnValueOnce({ success: false, error: { issues } } as any);

      await controller.update(req, res as Response, next);

      expect(errorHandlerMock.badRequestException).toHaveBeenCalledWith('Invalid field', expect.any(Object));
    });

    it('should call next on exception', async () => {
      const req = { body: { name: 'Updated' }, params: { id: 'u1' } } as any;
      serviceMock.updateUser.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.update(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('get', () => {
    it('should return user', async () => {
      const req = { params: { id: 'u1' } } as any;
      const user = {
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: RoleEnum.ADMIN,
        password: '',
        createdAt: '',
      };
      serviceMock.getUser.mockReturnValue(user);

      await controller.get(req, res as Response, next);

      expect(serviceMock.getUser).toHaveBeenCalledWith('u1');
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should call next on exception', async () => {
      const req = { params: { id: 'u1' } } as any;
      (serviceMock.getUser as jest.Mock).mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.get(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getPaginated', () => {
    it('should call service with query params', async () => {
      const req = { query: { page: '2', limit: '5' } } as any;
      const result = { data: [], metadata: { page: 2, limit: 5, total: 0, totalPages: 1 } };
      serviceMock.getUsersPaginated.mockReturnValue(result);

      await controller.getPaginated(req, res as Response, next);

      expect(serviceMock.getUsersPaginated).toHaveBeenCalledWith(2, 5);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should default page and limit if not provided', async () => {
      const req = { query: {} } as any;
      const result = { data: [], metadata: { page: 1, limit: 10, total: 0, totalPages: 1 } };
      serviceMock.getUsersPaginated.mockReturnValue(result);

      await controller.getPaginated(req, res as Response, next);

      expect(serviceMock.getUsersPaginated).toHaveBeenCalledWith(1, 10);
    });

    it('should call next on exception', async () => {
      const req = {} as Request;
      (serviceMock.getUsersPaginated as jest.Mock).mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.getPaginated(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('delete', () => {
    it('should delete user and return it', async () => {
      const req = { params: { id: 'u1' } } as any;
      const deleted = {
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: RoleEnum.ADMIN,
        password: '',
        createdAt: '',
      };
      serviceMock.deleteUser.mockReturnValue(deleted);

      await controller.delete(req, res as Response, next);

      expect(serviceMock.deleteUser).toHaveBeenCalledWith('u1');
      expect(res.json).toHaveBeenCalledWith(deleted);
    });

    it('should call next on exception', async () => {
      const req = { params: { id: 'u1' } } as any;
      (serviceMock.deleteUser as jest.Mock).mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.delete(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
