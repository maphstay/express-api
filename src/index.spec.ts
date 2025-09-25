import { jest, describe, it, expect } from '@jest/globals';

describe('index.ts', () => {
  it('should start server and log messages', () => {
    jest.resetModules();

    const infoMock = jest.fn();

    jest.mock('@logging/logger.service', () => ({
      LoggerService: jest.fn().mockImplementation(() => ({
        info: infoMock,
      })),
    }));

    const listenMock = jest.fn((port, cb: any) => cb());

    jest.mock('./app', () => ({
      __esModule: true,
      default: { listen: listenMock },
    }));

    jest.isolateModules(() => {
      require('./index');
    });

    expect(listenMock).toHaveBeenCalledWith(expect.any(Number), expect.any(Function));

    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining('🚀 Server running on'));
    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining('📑 Swagger docs on'));
  });
});
