export interface IExtraOptions {
  serviceName: string;
  serviceMethod: string;
  context?: string;
  data?: Record<string, unknown>;
}

export abstract class IErrorHandlingService {
  abstract badRequestException(message: string, extra: IExtraOptions): never;
  abstract unauthorizedException(message: string, extra: IExtraOptions): never;
  abstract forbiddenException(message: string, extra: IExtraOptions): never;
  abstract notFoundException(message: string, extra: IExtraOptions): never;
  abstract conflictException(message: string, extra: IExtraOptions): never;
  abstract unsupportedMediaTypeException(message: string, extra: IExtraOptions): never;
  abstract internalServerErrorException(message: string, extra: IExtraOptions): never;
}
