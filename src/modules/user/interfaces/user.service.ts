import { IPaginatedResponse } from '@bases/paginated';
import { ICreateUserDto } from '../dto/createUser.dto';
import { IUpdateUserDto } from '../dto/updateUser.dto';
import { IUser, User } from '../user.entity';

export abstract class IUserService {
  abstract createUser(createUserDto: ICreateUserDto): IUser;
  abstract updateUser(id: string, updateUserDto: IUpdateUserDto): IUser;
  abstract getUser(id: string): IUser;
  abstract getUsersPaginated(page?: number, limit?: number): IPaginatedResponse<typeof User>;
  abstract deleteUser(id: string): IUser;
}
