import { IUser } from '@modules/user/user.entity';

export abstract class IAuthService {
  abstract validateUser(email: string, password: string): IUser;
  abstract generateToken(user: IUser): string;
}
