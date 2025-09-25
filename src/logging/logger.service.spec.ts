import { LoggerService } from './logger.service';
import { winstonLogger } from './logger.config';

jest.mock('./logger.config', () => ({
  winstonLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LoggerService();
  });

  const testCases = [
    { method: 'info', loggerMethod: 'info' },
    { method: 'warn', loggerMethod: 'warn' },
    { method: 'error', loggerMethod: 'error' },
    { method: 'debug', loggerMethod: 'debug' },
  ] as const;

  testCases.forEach(({ method, loggerMethod }) => {
    describe(method, () => {
      it(`should call winstonLogger.${loggerMethod} with message and meta`, () => {
        const message = 'test message';
        const meta = { userId: 123 };

        (service as any)[method](message, meta);

        expect(winstonLogger[loggerMethod]).toHaveBeenCalledWith(message, meta);
      });

      it(`should call winstonLogger.${loggerMethod} with empty meta if not provided`, () => {
        const message = 'test message without meta';

        (service as any)[method](message);

        expect(winstonLogger[loggerMethod]).toHaveBeenCalledWith(message, {});
      });
    });
  });
});
