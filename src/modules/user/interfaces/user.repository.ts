import { ICreateUserDto } from '../dto/createUser.dto';
import { IUpdateUserDto } from '../dto/updateUser.dto';
import { IUser } from '../user.entity';

export abstract class IUserRepository {
  abstract getAll(): IUser[];
  abstract add(createUserDto: ICreateUserDto): IUser;
  abstract updateByIndex(index: number, updateUserDto: IUpdateUserDto): IUser;
  abstract findByIdWithIndex(id: string): { user: IUser | undefined; index: number };
  abstract findByEmailWithIndex(email: string): { user: IUser | undefined; index: number };
  abstract deleteByIndex(index: number): void;
}
