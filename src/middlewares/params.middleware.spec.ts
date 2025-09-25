import { Request, Response, NextFunction } from 'express';
import { paramSchemas, validateRouteParams } from './params.middleware';

describe('validateRouteParams middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should call next if all parameters are valid (from params)', () => {
    req.params = { id: '46e07f57-987d-4645-a6d4-2e3a0bf52e58', topicId: '46e07f57-987d-4645-a6d4-2e3a0bf52e58' };
    const middleware = validateRouteParams(['id', 'topicId']);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should call next if all parameters are valid (from query)', () => {
    req.query = { page: '2', limit: '10' };
    const middleware = validateRouteParams(['page', 'limit']);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if a parameter is invalid', () => {
    req.params = { id: 'invalid-uuid' };
    const middleware = validateRouteParams(['id']);

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid parameter(s): id',
        details: expect.stringContaining('ID must be a valid UUID'),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should use error.message if error.issues is undefined', () => {
    const middleware = validateRouteParams(['id']);
    const customError = { message: 'Custom error' };

    jest.spyOn(paramSchemas['id'], 'parse').mockImplementation(() => {
      throw customError;
    });

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        details: 'Custom error',
      }),
    );
  });

  it('should fallback to "Invalid value" if neither issues nor message exist', () => {
    const req = { params: { id: 'anything' }, query: {} } as Partial<Request>;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    const next = jest.fn() as NextFunction;

    jest.spyOn(paramSchemas['id'], 'parse').mockImplementation(() => {
      throw {};
    });

    const middleware = validateRouteParams(['id']);
    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        details: 'Invalid value',
      }),
    );
  });

  it('should ignore unknown parameters', () => {
    req.params = { unknown: '123' };
    const middleware = validateRouteParams(['unknown']);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle multiple invalid parameters', () => {
    req.query = { from: 'not-uuid', to: 'invalid' };
    const middleware = validateRouteParams(['from', 'to']);

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid parameter(s): from, to',
        details: expect.stringContaining('From must be a valid UUID'),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
