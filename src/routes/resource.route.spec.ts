import request from 'supertest';
import express, { Express } from 'express';
import resourceRouter from './resource.route';
import { ResourceService } from '@modules/resource/resource.service';
import { RoleEnum } from '@modules/user/user.entity';

jest.mock('@modules/resource/resource.service');
jest.mock('@errors/errorHandling.service');
jest.mock('@modules/resource/resource.repository');
jest.mock('@modules/topic/topic.repository');
jest.mock('@middlewares/authentication.middleware', () => ({
  authenticateJWT: (req: any, res: any, next: any) => {
    req.user = { id: 'user1', role: RoleEnum.ADMIN };
    next();
  },
}));
jest.mock('@middlewares/authorization.middleware', () => ({
  authorize: (roles: RoleEnum[]) => (req: any, res: any, next: any) => next(),
}));
jest.mock('@middlewares/params.middleware', () => ({
  validateRouteParams: (params: string[]) => (req: any, res: any, next: any) => next(),
}));

describe('Resource Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/resource', resourceRouter);
  });

  it('POST /resource should return 201', async () => {
    const serviceMock = ResourceService.prototype as jest.Mocked<ResourceService>;
    serviceMock.createResource.mockReturnValue({ id: 'res1', name: 'Resource 1' } as any);

    const res = await request(app).post('/resource').send({
      topicId: '44890388-8220-4358-9d79-39eeb3d1e003',
      url: 'http://www.test.com',
      description: 'test',
      type: 'image',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('res1');
  });

  it('GET /resource should return paginated data', async () => {
    const serviceMock = ResourceService.prototype as jest.Mocked<ResourceService>;
    serviceMock.getResourcesPaginated.mockReturnValue({
      metadata: { total: 1, page: 1, limit: 10, totalPages: 1 },
      data: [{ id: 'res1', name: 'Resource 1' }],
    } as any);

    const res = await request(app).get('/resource').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('res1');
  });

  it('GET /resource/:id should return a resource', async () => {
    const serviceMock = ResourceService.prototype as jest.Mocked<ResourceService>;
    serviceMock.getResource.mockReturnValue({ id: 'res1', name: 'Resource 1' } as any);

    const res = await request(app).get('/resource/res1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('res1');
  });

  it('PATCH /resource/:id should update a resource', async () => {
    const serviceMock = ResourceService.prototype as jest.Mocked<ResourceService>;
    serviceMock.updateResource.mockReturnValue({ id: 'res1', name: 'Updated' } as any);

    const res = await request(app).patch('/resource/res1').send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('DELETE /resource/:id should delete a resource', async () => {
    const serviceMock = ResourceService.prototype as jest.Mocked<ResourceService>;
    serviceMock.deleteResource.mockReturnValue({ success: true } as any);

    const res = await request(app).delete('/resource/res1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
