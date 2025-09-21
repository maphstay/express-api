import { LoggerService } from '@logging/logger.service';
import { Request, Response, NextFunction } from 'express';

export class ErrorMiddleware {
  constructor(private logger: LoggerService) {}

  handle = (err: any, req: Request, res: Response, next: NextFunction) => {
    const isHandledError = err && typeof err.status === 'number' && typeof err.message === 'string';

    const status = isHandledError ? err.status : 500;
    const message = isHandledError ? err.message : 'Internal Server Error';
    const extra = isHandledError ? { ...err } : {};

    let logType: 'info' | 'warn' | 'error' | 'debug' = 'error';
    if (status >= 500) logType = 'error';
    else if (status >= 400 && status < 500) logType = 'warn';
    else logType = 'info';

    this.logger[logType](`HTTP ${req.method} ${req.originalUrl} -`, {
      status,
      message,
      stack: err.stack,
      params: req.params,
      query: req.query,
      body: req.body,
      ip: req.ip,
      ...extra,
    });

    res.status(status).json({ status, message });
  };
}
