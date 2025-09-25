import { RoleEnum } from '@modules/user/user.entity';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { authenticateJWT } from './authentication.middleware';

jest.mock('jsonwebtoken');

describe('authenticateJWT middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no authorization header', () => {
    authenticateJWT(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header is malformed', () => {
    req.headers!.authorization = 'Token abc123';
    authenticateJWT(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers!.authorization = 'Bearer invalidtoken';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    authenticateJWT(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and attach user to request if token is valid', () => {
    const user = { id: '1', email: 'test@test.com', role: RoleEnum.ADMIN };
    req.headers!.authorization = 'Bearer validtoken';
    (jwt.verify as jest.Mock).mockReturnValue(user);

    authenticateJWT(req as Request, res as Response, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
