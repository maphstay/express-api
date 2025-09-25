import { ErrorMiddleware } from './error.middleware';
import { LoggerService } from '@logging/logger.service';
import { Request, Response, NextFunction } from 'express';

describe('ErrorMiddleware', () => {
  let middleware: ErrorMiddleware;
  let loggerMock: jest.Mocked<LoggerService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;

    middleware = new ErrorMiddleware(loggerMock);

    req = {
      method: 'GET',
      originalUrl: '/test',
      params: {},
      query: {},
      body: {},
      ip: '127.0.0.1',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it('should handle a known error with status < 500', () => {
    const err = { status: 400, message: 'Bad request', stack: 'stacktrace' };

    middleware.handle(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: 400, message: 'Bad request' });
    expect(loggerMock.warn).toHaveBeenCalledWith(
      'HTTP GET /test -',
      expect.objectContaining({
        status: 400,
        message: 'Bad request',
        stack: 'stacktrace',
      }),
    );
  });

  it('should handle a known error with status >= 500', () => {
    const err = { status: 500, message: 'Internal error', stack: 'stacktrace' };

    middleware.handle(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 500, message: 'Internal error' });
    expect(loggerMock.error).toHaveBeenCalledWith(
      'HTTP GET /test -',
      expect.objectContaining({
        status: 500,
        message: 'Internal error',
        stack: 'stacktrace',
      }),
    );
  });

  it('should log as info for status < 400', () => {
    const err = { status: 200, message: 'OK', stack: 'stacktrace' };

    middleware.handle(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 200, message: 'OK' });
    expect(loggerMock.info).toHaveBeenCalledWith(
      'HTTP GET /test -',
      expect.objectContaining({
        status: 200,
        message: 'OK',
        stack: 'stacktrace',
      }),
    );
  });

  it('should handle unknown errors', () => {
    const err = new Error('Unexpected');

    middleware.handle(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 500, message: 'Internal Server Error' });
    expect(loggerMock.error).toHaveBeenCalledWith(
      'HTTP GET /test -',
      expect.objectContaining({
        status: 500,
        message: 'Internal Server Error',
        stack: err.stack,
      }),
    );
  });
});
