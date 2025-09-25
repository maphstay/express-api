import request from 'supertest';
import express, { Router } from 'express';
import authRouter from './auth.route';
import { AuthService } from '@modules/auth/auth.service';

jest.mock('@modules/auth/auth.service');
jest.mock('@errors/errorHandling.service');
jest.mock('@modules/user/user.repository');

describe('Auth Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  it('POST /auth/login should return 200', async () => {
    const authServiceMock = AuthService.prototype as jest.Mocked<AuthService>;
    authServiceMock.validateUser.mockReturnValue({ id: '1', email: 'a@b.com', role: 'ADMIN', password: 'pass' } as any);
    authServiceMock.generateToken.mockReturnValue('token123');

    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'pass' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('token123');
  });
});
