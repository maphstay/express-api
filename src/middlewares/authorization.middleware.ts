import { RoleEnum } from '@modules/user/user.entity';
import { Request, Response, NextFunction } from 'express';

export const authorize = (allowedRoles: RoleEnum[]) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as { role?: RoleEnum };

    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: 403,
        message: `User role '${user.role}' does not have permission to access this resource`,
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      details: (err as Error).message,
    });
  }
};
