import { RoleEnum } from '../../role.enum';

declare global {
  namespace Express {
    export interface UserPayload {
      id: string;
      email: string;
      role: RoleEnum;
    }

    export interface Request {
      user?: UserPayload;
    }
  }
}
