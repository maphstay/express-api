import { Request, Response, NextFunction } from 'express';
import { readDB } from '@database/jsonDb';
import { Role } from '@modules/auth/role.model';

// Very simple token -> user mapping for demo
const tokens: Record<string, string> = {
  'admin-token': 'admin@example.com',
  'editor-token': 'editor@example.com',
  'viewer-token': 'viewer@example.com',
};

export function mockAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.toString().replace('Bearer ', '') ?? '';
  const email = tokens[token];
  if (!email) {
    // optional: allow anonymous viewers to get read endpoints? Here we'll set req.user undefined
    (req as any).user = undefined;
    return next();
  }
  const db = readDB();
  const user = db.users.find((u: any) => u.email === email);
  (req as any).user = user;
  return next();
}

// requireRole is a Strategy: check user's role per endpoint
export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // ensure mockAuth ran
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
