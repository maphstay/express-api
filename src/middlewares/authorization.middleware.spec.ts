import { RoleEnum } from '@modules/user/user.entity';
import { Request, Response, NextFunction } from 'express';
import { authorize } from './authorization.middleware';

describe('authorize middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 403 if user is not present', () => {
    const middleware = authorize([RoleEnum.ADMIN]);
    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      message: "User role 'undefined' does not have permission to access this resource",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not present', () => {
    req.user = {} as any;
    const middleware = authorize([RoleEnum.ADMIN]);
    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      message: "User role 'undefined' does not have permission to access this resource",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not allowed', () => {
    req.user = { role: RoleEnum.EDITOR } as any;
    const middleware = authorize([RoleEnum.ADMIN]);
    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      message: "User role 'editor' does not have permission to access this resource",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user role is allowed', () => {
    req.user = { role: RoleEnum.ADMIN } as any;
    const middleware = authorize([RoleEnum.ADMIN, RoleEnum.EDITOR]);
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 500 if error occurs', () => {
    req.user = { role: RoleEnum.ADMIN } as any;
    const middleware = authorize([RoleEnum.ADMIN]);
    const spy = jest.spyOn(Array.prototype, 'includes').mockImplementation(() => {
      throw new Error('fail');
    });

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      details: 'fail',
    });

    spy.mockRestore();
  });
});
