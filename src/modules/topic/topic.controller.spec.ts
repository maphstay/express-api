import { TopicController } from './topic.controller';
import { ITopicService } from './interfaces/topic.service';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { Request, Response, NextFunction } from 'express';
import { CreateTopicDto } from './dto/createTopic.dto';
import { UpdateTopicDto } from './dto/updateTopic.dto';

describe('TopicController', () => {
  let controller: TopicController;
  let serviceMock: jest.Mocked<ITopicService>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    serviceMock = {
      createTopic: jest.fn(),
      updateTopic: jest.fn(),
      getTopic: jest.fn(),
      getTopicsPaginated: jest.fn(),
      deleteTopic: jest.fn(),
      shortestPath: jest.fn(),
      listVersions: jest.fn(),
    } as any;

    errorHandlerMock = {
      badRequestException: jest.fn(),
      notFoundException: jest.fn(),
    } as any;

    controller = new TopicController(serviceMock, errorHandlerMock);
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return 201 with created topic', async () => {
      const req = { body: { name: 'Topic', content: 'content' } } as any;
      const topic = { id: 't1', ...req.body };
      serviceMock.createTopic.mockReturnValue(topic);

      await controller.create(req, res as Response, next);

      expect(serviceMock.createTopic).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(topic);
    });

    it('should call badRequestException if DTO is invalid', async () => {
      const req = { body: { invalid: 'oops' } } as any;
      const issues = [{ message: 'Invalid field' }];
      jest.spyOn(CreateTopicDto, 'safeParse').mockReturnValueOnce({ success: false, error: { issues } } as any);

      await controller.create(req, res as Response, next);

      expect(errorHandlerMock.badRequestException).toHaveBeenCalledWith('Invalid field', expect.any(Object));
    });

    it('should call next on exception', async () => {
      const req = { body: { name: 'Topic', content: 'content' } } as any;
      serviceMock.createTopic.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.create(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('update', () => {
    it('should return updated topic', async () => {
      const req = { body: { name: 'Topic', content: 'content' }, params: { id: 't1' } } as any;
      const updated = { id: 't1', ...req.body };
      serviceMock.updateTopic.mockReturnValue(updated);

      await controller.update(req, res as Response, next);

      expect(serviceMock.updateTopic).toHaveBeenCalledWith('t1', req.body);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('should call badRequestException if DTO invalid', async () => {
      const req = { body: { invalid: 'oops' }, params: { id: 't1' } } as any;
      const issues = [{ message: 'Invalid field' }];
      jest.spyOn(UpdateTopicDto, 'safeParse').mockReturnValueOnce({ success: false, error: { issues } } as any);

      await controller.update(req, res as Response, next);

      expect(errorHandlerMock.badRequestException).toHaveBeenCalledWith('Invalid field', expect.any(Object));
    });

    it('should call next on exception', async () => {
      const req = { body: { title: 'Updated' }, params: { id: 't1' } } as any;
      serviceMock.updateTopic.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.update(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('get', () => {
    it('should return topic without version', async () => {
      const req = { params: { id: 't1' }, query: {} } as any;
      const topic = { id: 't1', title: 'Topic' };
      serviceMock.getTopic.mockReturnValue(topic);

      await controller.get(req, res as Response, next);

      expect(serviceMock.getTopic).toHaveBeenCalledWith('t1', undefined);
      expect(res.json).toHaveBeenCalledWith(topic);
    });

    it('should return topic with version', async () => {
      const req = { params: { id: 't1' }, query: { version: '2' } } as any;
      const topic = { id: 't1', title: 'Topic', version: 2 };
      serviceMock.getTopic.mockReturnValue(topic);

      await controller.get(req, res as Response, next);

      expect(serviceMock.getTopic).toHaveBeenCalledWith('t1', 2);
      expect(res.json).toHaveBeenCalledWith(topic);
    });

    it('should call next on exception', async () => {
      const req = { params: { id: 't1' } } as any;
      serviceMock.getTopic.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.get(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getPaginated', () => {
    it('should call service with query params', async () => {
      const req = { query: { page: '2', limit: '5' } } as any;
      const result = { data: [], metadata: { page: 2, limit: 5, total: 0, totalPages: 1 } };
      serviceMock.getTopicsPaginated.mockReturnValue(result);

      await controller.getPaginated(req, res as Response, next);

      expect(serviceMock.getTopicsPaginated).toHaveBeenCalledWith(2, 5);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should default page and limit if not provided', async () => {
      const req = { query: {} } as any;
      const result = { data: [], metadata: { page: 1, limit: 10, total: 0, totalPages: 1 } };
      serviceMock.getTopicsPaginated.mockReturnValue(result);

      await controller.getPaginated(req, res as Response, next);

      expect(serviceMock.getTopicsPaginated).toHaveBeenCalledWith(1, 10);
    });

    it('should call next on exception', async () => {
      const req = {} as Request;
      serviceMock.getTopicsPaginated.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.getPaginated(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('delete', () => {
    it('should delete topic and return it', async () => {
      const req = { params: { id: 't1' } } as any;
      const result = { deleted: 1 };
      serviceMock.deleteTopic.mockReturnValue(result);

      await controller.delete(req, res as Response, next);

      expect(serviceMock.deleteTopic).toHaveBeenCalledWith('t1');
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should call next on exception', async () => {
      const req = { params: { id: 't1' } } as any;
      serviceMock.deleteTopic.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.delete(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('shortestPath', () => {
    it('should return path', async () => {
      const req = { query: { from: 't1', to: 't2' } } as any;
      const path = ['t1', 't2'];
      serviceMock.shortestPath.mockReturnValue(path);

      await controller.shortestPath(req, res as Response, next);

      expect(serviceMock.shortestPath).toHaveBeenCalledWith('t1', 't2');
      expect(res.json).toHaveBeenCalledWith({ path });
    });

    it('should call next on exception', async () => {
      const req = { query: { from: 't1', to: 't2' } } as any;
      serviceMock.shortestPath.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.shortestPath(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('listVersions', () => {
    it('should return versions', async () => {
      const req = { params: { id: 't1' } } as any;
      const versions = [
        { id: 'tv1', topicId: 't1', name: '', content: '', version: 1, createdAt: '' },
        { id: 'tv1', topicId: 't1', name: '', content: '', version: 2, createdAt: '' },
      ];
      serviceMock.listVersions.mockReturnValue(versions);

      await controller.listVersions(req, res as Response, next);

      expect(serviceMock.listVersions).toHaveBeenCalledWith('t1');
      expect(res.json).toHaveBeenCalledWith(versions);
    });

    it('should call next on exception', async () => {
      const req = { params: { id: 't1' } } as any;
      serviceMock.listVersions.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.listVersions(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
