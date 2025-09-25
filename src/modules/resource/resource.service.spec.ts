import { ResourceService } from './resource.service';
import { IResourceRepository } from './interfaces/resource.repository';
import { ITopicRepository } from '@modules/topic/interfaces/topic.repository';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { ICreateResourceDto } from './dto/createResource.dto';
import { IUpdateResourceDto } from './dto/updateResource.dto';
import { IResource, ResourceType } from './resource.entity';

describe('ResourceService', () => {
  let service: ResourceService;
  let repositoryMock: jest.Mocked<IResourceRepository>;
  let topicRepoMock: jest.Mocked<ITopicRepository>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;

  const mockResource: IResource = {
    id: 'r1',
    topicId: 't1',
    description: 'desc',
    url: 'url',
    type: ResourceType.VIDEO,
    createdAt: '2025-09-24T00:00:00.000Z',
    updatedAt: '2025-09-24T00:00:00.000Z',
  };

  beforeEach(() => {
    repositoryMock = {
      getAll: jest.fn(),
      add: jest.fn(),
      findByIdWithIndex: jest.fn(),
      updateByIndex: jest.fn(),
      deleteByIndex: jest.fn(),
      findByTopicId: jest.fn(),
      deleteByTopicId: jest.fn(),
    } as any;

    topicRepoMock = {
      findByTopicId: jest.fn(),
    } as any;

    errorHandlerMock = {
      notFoundException: jest.fn(),
    } as any;

    service = new ResourceService(repositoryMock, topicRepoMock, errorHandlerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createResource', () => {
    it('should create resource if topic exists', () => {
      const dto: ICreateResourceDto = { topicId: 't1', description: 'desc', url: 'url', type: ResourceType.VIDEO };
      topicRepoMock.findByTopicId.mockReturnValue([{}] as any);
      repositoryMock.add.mockReturnValue(mockResource);

      const result = service.createResource(dto);
      expect(topicRepoMock.findByTopicId).toHaveBeenCalledWith('t1');
      expect(repositoryMock.add).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResource);
    });

    it('should throw notFoundException if topic does not exist', () => {
      const dto: ICreateResourceDto = { topicId: 't1', description: 'desc', url: 'url', type: ResourceType.VIDEO };
      topicRepoMock.findByTopicId.mockReturnValue([]);

      service.createResource(dto);
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `Resource with ID: t1 not found`,
        expect.objectContaining({ serviceName: 'ResourceService', serviceMethod: 'createResource' }),
      );
    });
  });

  describe('updateResource', () => {
    it('should update existing resource', () => {
      const updateDto: IUpdateResourceDto = { description: 'updated' };
      repositoryMock.findByIdWithIndex.mockReturnValue({ resource: mockResource, index: 0 });
      repositoryMock.updateByIndex.mockReturnValue({ ...mockResource, description: 'updated' });

      const result = service.updateResource('r1', updateDto);
      expect(repositoryMock.updateByIndex).toHaveBeenCalledWith(0, updateDto);
      expect(result.description).toBe('updated');
    });

    it('should throw notFoundException if resource not found', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ resource: undefined, index: -1 });

      service.updateResource('r1', { description: 'updated' });
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `Resource with ID: r1 not found`,
        expect.objectContaining({ serviceName: 'ResourceService', serviceMethod: 'getResource' }),
      );
    });
  });

  describe('getResource', () => {
    it('should return resource if exists', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ resource: mockResource, index: 0 });

      const result = service.getResource('r1');
      expect(result).toBe(mockResource);
    });

    it('should throw notFoundException if resource not found', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ resource: undefined, index: -1 });

      service.getResource('r1');
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `Resource with ID: r1 not found`,
        expect.objectContaining({ serviceName: 'ResourceService', serviceMethod: 'getResource' }),
      );
    });
  });

  describe('getResourcesPaginated', () => {
    it('should return paginated resources', () => {
      const resources = Array.from({ length: 15 }, (_, i) => ({ ...mockResource, id: `r${i}` }));
      repositoryMock.getAll.mockReturnValue(resources);

      const result = service.getResourcesPaginated(2, 5);
      expect(result.metadata.total).toBe(15);
      expect(result.metadata.page).toBe(2);
      expect(result.metadata.limit).toBe(5);
      expect(result.metadata.totalPages).toBe(3);
      expect(result.data).toHaveLength(5);
      expect(result.data[0].id).toBe('r5');
    });
  });

  describe('deleteResource', () => {
    it('should delete existing resource', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ resource: mockResource, index: 0 });

      const result = service.deleteResource('r1');
      expect(repositoryMock.deleteByIndex).toHaveBeenCalledWith(0);
      expect(result).toBe(mockResource);
    });

    it('should throw notFoundException if resource not found', () => {
      repositoryMock.findByIdWithIndex.mockReturnValue({ resource: undefined, index: -1 });

      service.deleteResource('r1');
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `Resource with ID: r1 not found`,
        expect.objectContaining({ serviceName: 'ResourceService', serviceMethod: 'deleteResource' }),
      );
    });
  });
});
