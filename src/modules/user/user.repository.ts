import { v4 as uuid } from 'uuid';
import { IUserRepository } from './interfaces/user.repository';
import { IUser } from './user.entity';
import { readDB, writeDB } from '@database/jsonDb';
import { ICreateUserDto } from './dto/createUser.dto';
import { now } from '@utils/nowGenerateDate';
import { IUpdateUserDto } from './dto/updateUser.dto';
import { hashPassword } from '@utils/passwordHash';

export class UserRepository implements IUserRepository {
  public getAll(): IUser[] {
    const db = readDB();
    return [...db.users];
  }

  public add(createUserDto: ICreateUserDto): IUser {
    const db = readDB();
    const createdObj: IUser = {
      id: uuid(),
      name: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role,
      password: hashPassword(createUserDto.password),
      createdAt: now(),
      updatedAt: now(),
    };
    db.users.push(createdObj);
    writeDB(db);
    return createdObj;
  }

  public updateByIndex(index: number, updateUserDto: IUpdateUserDto): IUser {
    const db = readDB();

    db.users[index] = {
      ...db.users[index],
      name: updateUserDto.name ?? db.users[index].name,
      role: updateUserDto.role ?? db.users[index].role,
      password: (updateUserDto.password && hashPassword(updateUserDto.password)) ?? db.users[index].password,
      updatedAt: now(),
    };

    writeDB(db);
    return db.users[index];
  }

  public findByIdWithIndex(id: string): { user: IUser | undefined; index: number } {
    const db = readDB();
    const index = db.users.findIndex((r) => r.id === id);
    const user = index !== -1 ? db.users[index] : undefined;
    return { user, index };
  }

  public findByEmailWithIndex(email: string): { user: IUser | undefined; index: number } {
    const db = readDB();
    const index = db.users.findIndex((r) => r.email === email);
    const user = index !== -1 ? db.users[index] : undefined;
    return { user, index };
  }

  public deleteByIndex(index: number): void {
    const db = readDB();
    db.users.splice(index, 1);
    writeDB(db);
  }
}
