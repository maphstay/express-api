import request from 'supertest';
import express from 'express';
import userRouter from './user.route';
import { UserService } from '@modules/user/user.service';
import { RoleEnum } from '@modules/user/user.entity';

jest.mock('@modules/user/user.service');
jest.mock('@errors/errorHandling.service');
jest.mock('@middlewares/authentication.middleware', () => ({
  authenticateJWT: (req: any, res: any, next: any) => next(),
}));
jest.mock('@middlewares/authorization.middleware', () => ({
  authorize: (roles: RoleEnum[]) => (req: any, res: any, next: any) => next(),
}));
jest.mock('@middlewares/params.middleware', () => ({
  validateRouteParams: (params: string[]) => (req: any, res: any, next: any) => next(),
}));

describe('User Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/user', userRouter);
  });

  it('POST /user should create a user', async () => {
    const serviceMock = UserService.prototype as jest.Mocked<UserService>;
    serviceMock.createUser.mockReturnValue({ id: 'u1', email: 'a@b.com' } as any);

    const res = await request(app)
      .post('/user')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com', role: 'admin', password: 'test2025' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('u1');
  });

  it('GET /user should return paginated users', async () => {
    const serviceMock = UserService.prototype as jest.Mocked<UserService>;
    serviceMock.getUsersPaginated.mockReturnValue({
      metadata: { total: 1, page: 1, limit: 10, totalPages: 1 },
      data: [{ id: 'u1', email: 'a@b.com' }],
    } as any);

    const res = await request(app).get('/user').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('u1');
  });

  it('GET /user/:id should return a single user', async () => {
    const serviceMock = UserService.prototype as jest.Mocked<UserService>;
    serviceMock.getUser.mockReturnValue({ id: 'u1', email: 'a@b.com' } as any);

    const res = await request(app).get('/user/u1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('u1');
  });

  it('PATCH /user/:id should update a user', async () => {
    const serviceMock = UserService.prototype as jest.Mocked<UserService>;
    serviceMock.updateUser.mockReturnValue({ id: 'u1', email: 'updated@b.com' } as any);

    const res = await request(app).patch('/user/u1').send({ email: 'updated@b.com' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('updated@b.com');
  });

  it('DELETE /user/:id should delete a user', async () => {
    const serviceMock = UserService.prototype as jest.Mocked<UserService>;
    serviceMock.deleteUser.mockReturnValue({ deleted: true } as any);

    const res = await request(app).delete('/user/u1');

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
