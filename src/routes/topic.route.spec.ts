import request from 'supertest';
import express from 'express';
import topicRouter from './topic.route';
import { TopicService } from '@modules/topic/topic.service';
import { RoleEnum } from '@modules/user/user.entity';

jest.mock('@modules/topic/topic.service');
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

describe('Topic Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/topic', topicRouter);
  });

  it('POST /topic should create a topic', async () => {
    const serviceMock = TopicService.prototype as jest.Mocked<TopicService>;
    serviceMock.createTopic.mockReturnValue({ id: 't1', name: 'Topic 1' } as any);

    const res = await request(app).post('/topic').send({ name: 'Topic 1', content: 'content' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('t1');
  });

  it('GET /topic should return paginated topics', async () => {
    const serviceMock = TopicService.prototype as jest.Mocked<TopicService>;
    serviceMock.getTopicsPaginated.mockReturnValue({
      metadata: { total: 1, page: 1, limit: 10, totalPages: 1 },
      data: [{ id: 't1', name: 'Topic 1' }],
    } as any);

    const res = await request(app).get('/topic').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('t1');
  });

  it('GET /topic/:id should return a single topic', async () => {
    const serviceMock = TopicService.prototype as jest.Mocked<TopicService>;
    serviceMock.getTopic.mockReturnValue({ id: 't1', name: 'Topic 1' } as any);

    const res = await request(app).get('/topic/t1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('t1');
  });

  it('PUT /topic/:id should update a topic', async () => {
    const serviceMock = TopicService.prototype as jest.Mocked<TopicService>;
    serviceMock.updateTopic.mockReturnValue({ id: 't1', name: 'Updated Topic' } as any);

    const res = await request(app).put('/topic/t1').send({ name: 'Updated Topic' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Topic');
  });

  it('DELETE /topic/:id should delete a topic', async () => {
    const serviceMock = TopicService.prototype as jest.Mocked<TopicService>;
    serviceMock.deleteTopic.mockReturnValue({ deleted: true } as any);

    const res = await request(app).delete('/topic/t1');

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });

  it('GET /topic/:id/versions should list versions', async () => {
    const serviceMock = TopicService.prototype as jest.Mocked<TopicService>;
    serviceMock.listVersions.mockReturnValue([{ version: 1 }, { version: 2 }] as any);

    const res = await request(app).get('/topic/t1/versions');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('GET /topic/shortest/path should return shortest path', async () => {
    const serviceMock = TopicService.prototype as jest.Mocked<TopicService>;
    serviceMock.shortestPath.mockReturnValue(['t1', 't2', 't3'] as any);

    const res = await request(app).get('/topic/shortest/path').query({ from: 't1', to: 't3' });

    expect(res.status).toBe(200);
    expect(res.body.path).toEqual(['t1', 't2', 't3']);
  });
});
