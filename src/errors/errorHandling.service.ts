import { LoggerService } from '@logging/logger.service';
import { IErrorHandlingService, IExtraOptions } from './interfaces/errorHandling.service';

export class ErrorHandlingService implements IErrorHandlingService {
  private readonly logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
  }

  public badRequestException(message: string, extra: IExtraOptions): never {
    throw { status: 400, message: message || 'Bad request', ...extra };
  }

  public unauthorizedException(message: string, extra: IExtraOptions): never {
    throw { status: 401, message: message || 'Unauthorized', ...extra };
  }

  public forbiddenException(message: string, extra: IExtraOptions): never {
    throw { status: 403, message: message || 'Forbidden', ...extra };
  }

  public notFoundException(message: string, extra: IExtraOptions): never {
    throw { status: 404, message: message || 'Not found', ...extra };
  }

  public conflictException(message: string, extra: IExtraOptions): never {
    throw { status: 409, message: message || 'Conflict', ...extra };
  }

  public unsupportedMediaTypeException(message: string, extra: IExtraOptions): never {
    throw { status: 415, message: message || 'Unsupported media type', ...extra };
  }

  public internalServerErrorException(message: string, extra: IExtraOptions): never {
    throw { status: 500, message: message || 'Internal server error', ...extra };
  }
}
