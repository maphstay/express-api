import { ResourceController } from './resource.controller';
import { IResourceService } from './interfaces/resource.service';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { Request, Response, NextFunction } from 'express';
import { CreateResourceDto } from './dto/createResource.dto';
import { UpdateResourceDto } from './dto/updateResource.dto';
import { ResourceType } from './resource.entity';

describe('ResourceController', () => {
  let controller: ResourceController;
  let serviceMock: jest.Mocked<IResourceService>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    serviceMock = {
      createResource: jest.fn(),
      updateResource: jest.fn(),
      getResource: jest.fn(),
      getResourcesPaginated: jest.fn(),
      deleteResource: jest.fn(),
    } as any;

    errorHandlerMock = {
      badRequestException: jest.fn(),
      notFoundException: jest.fn(),
    } as any;

    controller = new ResourceController(serviceMock, errorHandlerMock);
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return 201 with created resource', async () => {
      const req = {
        body: {
          topicId: '46e07f57-987d-4645-a6d4-2e3a0bf52e58',
          description: 'desc',
          url: 'http://test.com',
          type: 'video',
        },
      } as Request;
      const resource = { id: 'r1', ...req.body };
      serviceMock.createResource.mockReturnValue(resource);

      await controller.create(req, res as Response, next);

      expect(serviceMock.createResource).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(resource);
    });

    it('should call badRequestException if DTO is invalid', async () => {
      const req = { body: { invalidField: 'oops' } } as any;
      const issues = [{ message: 'Invalid field' }];
      jest.spyOn(CreateResourceDto, 'safeParse').mockReturnValueOnce({ success: false, error: { issues } } as any);

      await controller.create(req, res as Response, next);

      expect(errorHandlerMock.badRequestException).toHaveBeenCalledWith('Invalid field', expect.any(Object));
    });

    it('should call next on exception', async () => {
      const req = {
        body: {
          topicId: '46e07f57-987d-4645-a6d4-2e3a0bf52e58',
          description: 'desc',
          url: 'http://test.com',
          type: 'video',
        },
      } as Request;

      serviceMock.createResource.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.create(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('update', () => {
    it('should return updated resource', async () => {
      const req = { body: { description: 'new' }, params: { id: 'r1' } } as any;
      const updated = {
        id: 'r1',
        description: 'new',
        topicId: 't1',
        url: 'url',
        type: ResourceType.VIDEO,
        createdAt: '',
      };
      serviceMock.updateResource.mockReturnValue(updated);

      await controller.update(req, res as Response, next);

      expect(serviceMock.updateResource).toHaveBeenCalledWith('r1', req.body);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('should call badRequestException if DTO invalid', async () => {
      const req = { body: { invalidField: 'oops' }, params: { id: 'r1' } } as any;
      const issues = [{ message: 'Invalid field' }];
      jest.spyOn(UpdateResourceDto, 'safeParse').mockReturnValue({ success: false, error: { issues } } as any);

      await controller.update(req, res as Response, next);

      expect(errorHandlerMock.badRequestException).toHaveBeenCalledWith('Invalid field', expect.any(Object));
    });

    it('should call next on exception', async () => {
      const req = {
        body: {
          description: 'desc',
          url: 'http://test.com',
          type: 'video',
        },
      } as Request;

      serviceMock.updateResource.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.update(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('get', () => {
    it('should return resource', async () => {
      const req = { params: { id: 'r1' } } as any;
      const resource = {
        id: 'r1',
        description: 'new',
        topicId: 't1',
        url: 'url',
        type: ResourceType.VIDEO,
        createdAt: '',
      };
      serviceMock.getResource.mockReturnValue(resource);

      await controller.get(req, res as Response, next);

      expect(serviceMock.getResource).toHaveBeenCalledWith('r1');
      expect(res.json).toHaveBeenCalledWith(resource);
    });

    it('should call next on exception', async () => {
      const req = { params: { id: 'r1' } } as any;
      serviceMock.getResource.mockImplementation(() => {
        throw new Error('fail');
      });

      await controller.get(req, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getPaginated', () => {
    it('should call service with query params', async () => {
      const req = { query: { page: '2', limit: '5' } } as any;
      const result = { data: [], metadata: { ...req.query, total: 0, totalPages: 1 } };
      serviceMock.getResourcesPaginated.mockReturnValue(result);

      await controller.getPaginated(req, res as Response, next);

      expect(serviceMock.getResourcesPaginated).toHaveBeenCalledWith(2, 5);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should default page and limit if not provided', async () => {
      const req = { query: {} } as any;
      const result = { data: [], metadata: { page: 1, limit: 10, total: 0, totalPages: 1 } };
      serviceMock.getResourcesPaginated.mockReturnValue(result);

      await controller.getPaginated(req, res as Response, next);

      expect(serviceMock.getResourcesPaginated).toHaveBeenCalledWith(1, 10);
    });

    it('should call next on exception', async () => {
      const req = {} as Request;

      serviceMock.getResourcesPaginated.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.getPaginated(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('delete', () => {
    it('should delete resource and return it', async () => {
      const req = { params: { id: 'r1' } } as any;
      const deleted = {
        id: 'r1',
        description: 'new',
        topicId: 't1',
        url: 'url',
        type: ResourceType.VIDEO,
        createdAt: '',
      };
      serviceMock.deleteResource.mockReturnValue(deleted);

      await controller.delete(req, res as Response, next);

      expect(serviceMock.deleteResource).toHaveBeenCalledWith('r1');
      expect(res.json).toHaveBeenCalledWith(deleted);
    });

    it('should call next on exception', async () => {
      const req = { params: { id: 'r1' } } as any;

      serviceMock.deleteResource.mockImplementation(() => {
        throw new Error('Fail');
      });

      await controller.delete(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
