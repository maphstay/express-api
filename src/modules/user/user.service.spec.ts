import { UserService } from './user.service';
import { IUserRepository } from './interfaces/user.repository';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { ICreateUserDto } from './dto/createUser.dto';
import { IUpdateUserDto } from './dto/updateUser.dto';
import { IUser, RoleEnum } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let repositoryMock: jest.Mocked<IUserRepository>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;

  const mockUser: IUser = {
    id: 'u1',
    name: 'Alice',
    email: 'alice@test.com',
    role: RoleEnum.ADMIN,
    password: 'hashed-123',
    createdAt: '2025-09-24T00:00:00.000Z',
    updatedAt: '2025-09-24T00:00:00.000Z',
  };

  beforeEach(() => {
    repositoryMock = {
      getAll: jest.fn(),
      add: jest.fn(),
      findByIdWithIndex: jest.fn(),
      findByEmailWithIndex: jest.fn(),
      updateByIndex: jest.fn(),
      deleteByIndex: jest.fn(),
    } as any;

    errorHandlerMock = {
      conflictException: jest.fn(),
      notFoundException: jest.fn(),
    } as any;

    service = new UserService(repositoryMock, errorHandlerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user if email does not exist', () => {
      const dto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
      repositoryMock.findByEmailWithIndex.mockReturnValue({ user: undefined, index: -1 });
      repositoryMock.add.mockReturnValue(mockUser);

      const result = service.createUser(dto);
      expect(repositoryMock.add).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockUser);
    });

    it('should throw conflictException if email already exists', () => {
      const dto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
      repositoryMock.findByEmailWithIndex.mockReturnValue({ user: mockUser, index: 0 });

      service.createUser(dto);
      expect(errorHandlerMock.conflictException).toHaveBeenCalledWith(
        `User with email: alice@test.com already exists`,
        expect.objectContaining({ serviceName: 'UserService', serviceMethod: 'createUser' }),
      );
    });
  });

  describe('updateUser', () => {
    it('should update existing user', () => {
      const updateDto: IUpdateUserDto = { name: 'Alice Updated' };
      repositoryMock.findByIdWithIndex.mockReturnValue({ user: mockUser, index: 0 });
      repositoryMock.updateByIndex.mockReturnValue({ ...mockUser, name: 'Alice Updated' });

      const result = service.updateUser('u1', updateDto);
      expect(repositoryMock.updateByIndex).toHaveBeenCalledWith(0, updateDto);
      expect(result.name).toBe('Alice Updated');
    });

    it('should throw notFoundException if user not found', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ user: undefined, index: -1 });

      service.updateUser('u1', { name: 'X' });
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `User with ID: u1 not found`,
        expect.objectContaining({ serviceName: 'UserService', serviceMethod: 'getUser' }),
      );
    });
  });

  describe('getUser', () => {
    it('should return user if exists', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ user: mockUser, index: 0 });

      const result = service.getUser('u1');
      expect(result).toBe(mockUser);
    });

    it('should throw notFoundException if user not found', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ user: undefined, index: -1 });

      service.getUser('u1');
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `User with ID: u1 not found`,
        expect.objectContaining({ serviceName: 'UserService', serviceMethod: 'getUser' }),
      );
    });
  });

  describe('getUsersPaginated', () => {
    it('should return paginated users', () => {
      const users = Array.from({ length: 15 }, (_, i) => ({ ...mockUser, id: `u${i}` }));
      repositoryMock.getAll.mockReturnValue(users);

      const result = service.getUsersPaginated(2, 5);
      expect(result.metadata.total).toBe(15);
      expect(result.metadata.page).toBe(2);
      expect(result.metadata.limit).toBe(5);
      expect(result.metadata.totalPages).toBe(3);
      expect(result.data).toHaveLength(5);
      expect(result.data[0].id).toBe('u5');
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ user: mockUser, index: 0 });

      const result = service.deleteUser('u1');
      expect(repositoryMock.deleteByIndex).toHaveBeenCalledWith(0);
      expect(result).toBe(mockUser);
    });

    it('should throw notFoundException if user not found', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ user: undefined, index: -1 });

      service.deleteUser('u1');
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `User with ID: u1 not found`,
        expect.objectContaining({ serviceName: 'UserService', serviceMethod: 'deleteUser' }),
      );
    });
  });
});
