import { IUser, User } from './user.entity';
import { IUserRepository } from './interfaces/user.repository';
import { IUserService } from './interfaces/user.service';
import { ICreateUserDto } from './dto/createUser.dto';
import { IUpdateUserDto } from './dto/updateUser.dto';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { IPaginatedResponse } from '@bases/paginated';

export class UserService implements IUserService {
  constructor(
    private repository: IUserRepository,
    private errorHandler: IErrorHandlingService,
  ) {}

  public createUser(createUserDto: ICreateUserDto): IUser {
    const { user } = this.repository.findByEmailWithIndex(createUserDto.email);

    if (user)
      return this.errorHandler.conflictException(`User with email: ${createUserDto.email} already exists`, {
        serviceName: UserService.name,
        serviceMethod: this.createUser.name,
      });

    return this.repository.add(createUserDto);
  }

  public updateUser(id: string, updateUserDto: IUpdateUserDto): IUser {
    const { user, index } = this.repository.findByIdWithIndex(id);

    if (!user)
      return this.errorHandler.notFoundException(`User with ID: ${id} not found`, {
        serviceName: UserService.name,
        serviceMethod: this.getUser.name,
      });

    return this.repository.updateByIndex(index, updateUserDto);
  }

  public getUser(id: string): IUser {
    const { user } = this.repository.findByIdWithIndex(id);

    if (!user)
      return this.errorHandler.notFoundException(`User with ID: ${id} not found`, {
        serviceName: UserService.name,
        serviceMethod: this.getUser.name,
      });

    return user;
  }

  public getUsersPaginated(page: number = 1, limit: number = 10): IPaginatedResponse<typeof User> {
    const allLatest = this.repository.getAll();
    const total = allLatest.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = allLatest.slice(start, end);

    return {
      metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data,
    };
  }

  public deleteUser(id: string): IUser {
    const { user, index } = this.repository.findByIdWithIndex(id);

    if (!user)
      return this.errorHandler.notFoundException(`User with ID: ${id} not found`, {
        serviceName: UserService.name,
        serviceMethod: this.deleteUser.name,
      });

    this.repository.deleteByIndex(index);

    return user;
  }
}
