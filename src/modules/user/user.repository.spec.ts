import { UserRepository } from './user.repository';
import * as jsonDb from '@database/jsonDb';
import { ICreateUserDto } from './dto/createUser.dto';
import { IUpdateUserDto } from './dto/updateUser.dto';
import { DBData } from '@database/jsonDb';
import { RoleEnum } from './user.entity';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('@utils/passwordHash', () => ({
  hashPassword: jest.fn((pwd) => `hashed-${pwd}`),
}));

jest.mock('@utils/nowGenerateDate', () => ({
  now: jest.fn(() => '2025-09-24T00:00:00.000Z'),
}));

describe('UserRepository', () => {
  let repository: UserRepository;
  let dbMock: DBData;

  beforeEach(() => {
    repository = new UserRepository();
    dbMock = { topicVersions: [], resources: [], users: [] };

    jest.spyOn(jsonDb, 'readDB').mockImplementation(() => dbMock);
    jest.spyOn(jsonDb, 'writeDB').mockImplementation((db) => {
      dbMock = db;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return all users with getAll', () => {
    const userDto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
    repository.add(userDto);
    repository.add({ ...userDto, email: 'bob@test.com' });

    const all = repository.getAll();
    expect(all).toHaveLength(2);
    expect(all).toEqual(dbMock.users);
  });

  it('should add a user', () => {
    const userDto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
    const result = repository.add(userDto);

    expect(result).toEqual({
      id: 'mock-uuid',
      name: 'Alice',
      email: 'alice@test.com',
      role: RoleEnum.ADMIN,
      password: 'hashed-123',
      createdAt: '2025-09-24T00:00:00.000Z',
      updatedAt: '2025-09-24T00:00:00.000Z',
    });

    expect(dbMock.users.length).toBe(1);
    expect(jsonDb.writeDB).toHaveBeenCalledWith(dbMock);
  });

  it('should find user by id with index', () => {
    const userDto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
    const added = repository.add(userDto);

    const { user, index } = repository.findByIdWithIndex(added.id);
    expect(user).toEqual(added);
    expect(index).toBe(0);
  });

  it('should return undefined and index -1 when findByIdWithIndex does not exist', () => {
    const result = repository.findByIdWithIndex('non-existing-id');
    expect(result.user).toBeUndefined();
    expect(result.index).toBe(-1);
  });

  it('should find user by email with index', () => {
    const userDto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
    const added = repository.add(userDto);

    const { user, index } = repository.findByEmailWithIndex(added.email);
    expect(user).toEqual(added);
    expect(index).toBe(0);
  });

  it('should return undefined and index -1 when findByEmailWithIndex does not exist', () => {
    const result = repository.findByEmailWithIndex('non-existing@email.com');
    expect(result.user).toBeUndefined();
    expect(result.index).toBe(-1);
  });

  it('should update user by index', () => {
    const userDto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
    repository.add(userDto);

    const updateDto: IUpdateUserDto = { name: 'Alice Updated', password: '456' };
    const updated = repository.updateByIndex(0, updateDto);

    expect(updated.name).toBe('Alice Updated');
    expect(updated.password).toBe('hashed-456');
    expect(updated.updatedAt).toBe('2025-09-24T00:00:00.000Z');
  });

  it('should fallback to current name and password when updateUserDto.name updateUserDto.password is undefined', () => {
    const userDto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
    repository.add(userDto);

    const updateDto: IUpdateUserDto = { role: RoleEnum.EDITOR };
    const updated = repository.updateByIndex(0, updateDto);

    expect(updated.name).toBe('Alice');
    expect(updated.role).toBe('editor');
    expect(updated.password).toBe('hashed-123');
  });

  it('should delete user by index', () => {
    const userDto: ICreateUserDto = { name: 'Alice', email: 'alice@test.com', role: RoleEnum.ADMIN, password: '123' };
    repository.add(userDto);

    repository.deleteByIndex(0);
    expect(dbMock.users.length).toBe(0);
  });
});
