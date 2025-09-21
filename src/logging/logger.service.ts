import { ILoggerService } from './interfaces/logger.service';
import { winstonLogger } from './logger.config';

export class LoggerService implements ILoggerService {
  info(message: string, meta: Record<string, unknown> = {}): void {
    winstonLogger.info(message, meta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    winstonLogger.warn(message, meta);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    winstonLogger.error(message, meta);
  }

  debug(message: string, meta: Record<string, unknown> = {}): void {
    winstonLogger.debug(message, meta);
  }
}
