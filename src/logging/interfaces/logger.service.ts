export abstract class ILoggerService {
  abstract info(message: string, meta?: Record<string, unknown>): void;
  abstract warn(message: string, meta?: Record<string, unknown>): void;
  abstract error(message: string, meta?: Record<string, unknown>): void;
  abstract debug(message: string, meta?: Record<string, unknown>): void;
}
