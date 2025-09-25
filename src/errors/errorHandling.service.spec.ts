import { ErrorHandlingService } from './errorHandling.service';
import { IExtraOptions } from './interfaces/errorHandling.service';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;
  const extra: IExtraOptions = { serviceName: 'TestService', serviceMethod: 'testMethod' };

  beforeEach(() => {
    service = new ErrorHandlingService();
  });

  const testCases = [
    {
      method: 'badRequestException',
      status: 400,
      defaultMessage: 'Bad request',
    },
    {
      method: 'unauthorizedException',
      status: 401,
      defaultMessage: 'Unauthorized',
    },
    {
      method: 'forbiddenException',
      status: 403,
      defaultMessage: 'Forbidden',
    },
    {
      method: 'notFoundException',
      status: 404,
      defaultMessage: 'Not found',
    },
    {
      method: 'conflictException',
      status: 409,
      defaultMessage: 'Conflict',
    },
    {
      method: 'unsupportedMediaTypeException',
      status: 415,
      defaultMessage: 'Unsupported media type',
    },
    {
      method: 'internalServerErrorException',
      status: 500,
      defaultMessage: 'Internal server error',
    },
  ] as const;

  testCases.forEach(({ method, status, defaultMessage }) => {
    describe(method, () => {
      it(`should throw with provided message and status ${status}`, () => {
        const message = 'Custom error';
        expect(() => (service as any)[method](message, extra)).toThrow(
          expect.objectContaining({
            status,
            message,
            ...extra,
          }),
        );
      });

      it(`should throw with default message "${defaultMessage}" if message is empty`, () => {
        expect(() => (service as any)[method]('', extra)).toThrow(
          expect.objectContaining({
            status,
            message: defaultMessage,
            ...extra,
          }),
        );
      });
    });
  });
});
