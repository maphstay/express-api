import request from 'supertest';
import app from '../src/app';
import { AuthService } from '../src/modules/auth/auth.service';
import { IUser, RoleEnum } from '../src/modules/user/user.entity';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../src/modules/user/user.repository';
import { ResourceRepository } from '../src/modules/resource/resource.repository';
import { ResourceType } from '../src/modules/resource/resource.entity';
import { TopicRepository } from '../src/modules/topic/topic.repository';

jest.mock('@modules/auth/auth.service');

describe('Integration tests - API', () => {
  let accessToken: string;
  const user: IUser = {
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: RoleEnum.ADMIN,
    createdAt: '',
  };

  beforeAll(() => {
    console.log(process.env.JWT_SECRET);
    (AuthService.prototype.generateToken as jest.Mock).mockImplementation((u: IUser) => {
      return jwt.sign({ id: u.id, email: u.email, role: u.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    });

    (AuthService.prototype.validateUser as jest.Mock).mockImplementation(() => user);

    accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Auth Routes', () => {
    it('POST /api/auth/login - should return token', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe('User Routes', () => {
    it('GET /api/users - should require JWT', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('GET /api/users - should return users with valid JWT', async () => {
      jest.spyOn(UserRepository.prototype, 'getAll').mockReturnValue([]);
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/users - create new user', async () => {
      const createUserDto = { name: 'New User', email: 'new@example.com', password: '123456789', role: RoleEnum.ADMIN };
      jest.spyOn(UserRepository.prototype, 'add').mockReturnValue({ ...createUserDto, id: 'u1', createdAt: '' });
      const res = await request(app).post('/api/users').send(createUserDto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('Resource Routes', () => {
    it('GET /api/resources - list resources', async () => {
      jest.spyOn(ResourceRepository.prototype, 'getAll').mockReturnValue([]);
      const res = await request(app).get('/api/resources').set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/resources - create resource', async () => {
      const createResourceDto = {
        topicId: '44890388-8220-4358-9d79-39eeb3d1e003',
        url: 'http://www.test.com',
        description: 'test',
        type: ResourceType.IMAGE,
      };
      jest
        .spyOn(ResourceRepository.prototype, 'add')
        .mockReturnValue({ ...createResourceDto, id: 'r1', createdAt: '' });
      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createResourceDto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('Topic Routes', () => {
    it('GET /api/topics - list topics', async () => {
      jest.spyOn(TopicRepository.prototype, 'getAll').mockReturnValue([]);
      const res = await request(app).get('/api/topics').set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/topics - create topic', async () => {
      const createTopicDto = {
        name: 'topic 3.1.2',
        content: 'topic content',
      };
      jest
        .spyOn(TopicRepository.prototype, 'add')
        .mockReturnValue({ ...createTopicDto, id: 't1', createdAt: '', topicId: 't1', version: 1 });
      const res = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTopicDto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
  });
});
