import request from 'supertest';
import express from 'express';
import app from './app';

jest.mock('@logging/logger.service', () => {
  return {
    LoggerService: jest.fn().mockImplementation(() => ({
      warn: jest.fn(),
    })),
  };
});

describe('App initialization', () => {
  it('should create an express app with routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
  });

  it('should handle errors using ErrorMiddleware', async () => {
    const testApp = express();
    testApp.get('/error', () => {
      throw { status: 400, message: 'Test error' };
    });

    const { ErrorMiddleware } = require('@middlewares/error.middleware');
    const { LoggerService } = require('@logging/logger.service');
    const logger = new LoggerService();
    const errorMiddleware = new ErrorMiddleware(logger);
    testApp.use(errorMiddleware.handle);

    const res = await request(testApp).get('/error');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 400, message: 'Test error' });
  });

  it('should have main API routes', async () => {
    await request(app).get('/api/auth');
    await request(app).get('/api/topics');
    await request(app).get('/api/resources');
    await request(app).get('/api/users');
  });
});
