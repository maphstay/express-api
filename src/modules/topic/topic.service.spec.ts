import { TopicService } from './topic.service';
import { ITopicRepository } from './interfaces/topic.repository';
import { IResourceRepository } from '@modules/resource/interfaces/resource.repository';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { ICreateTopicDto } from './dto/createTopic.dto';
import { IUpdateTopicDto } from './dto/updateTopic.dto';
import { ITopicVersion, ITreeNode } from './topic.entity';

describe('TopicService', () => {
  let service: TopicService;
  let repositoryMock: jest.Mocked<ITopicRepository>;
  let resourceRepoMock: jest.Mocked<IResourceRepository>;
  let errorHandlerMock: jest.Mocked<IErrorHandlingService>;

  const mockTopic: ITopicVersion = {
    id: 't1',
    topicId: 't1',
    name: 'Topic 1',
    content: 'Content 1',
    version: 1,
    parentTopicId: undefined,
    createdAt: '2025-09-24T00:00:00.000Z',
    updatedAt: '2025-09-24T00:00:00.000Z',
  };

  beforeEach(() => {
    repositoryMock = {
      getAll: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      findByTopicId: jest.fn(),
      findLatestVersions: jest.fn(),
      deleteByIds: jest.fn(),
    } as any;

    resourceRepoMock = {
      findByTopicId: jest.fn(),
      deleteByTopicId: jest.fn(),
    } as any;

    errorHandlerMock = {
      notFoundException: jest.fn(),
      conflictException: jest.fn(),
    } as any;

    service = new TopicService(repositoryMock, resourceRepoMock, errorHandlerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTopic', () => {
    it('should create topic without parent', () => {
      const dto: ICreateTopicDto = { name: 'New', content: 'Content' };
      repositoryMock.add.mockReturnValue(mockTopic);

      const result = service.createTopic(dto);
      expect(repositoryMock.add).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockTopic);
    });

    it('should create topic with existing parent', () => {
      const dto: ICreateTopicDto = { name: 'Child', content: 'Content', parentTopicId: 't1' };
      repositoryMock.findByTopicId.mockReturnValue([mockTopic]);
      repositoryMock.add.mockReturnValue(mockTopic);

      const result = service.createTopic(dto);
      expect(repositoryMock.add).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockTopic);
    });

    it('should throw notFoundException if parent does not exist', () => {
      const dto: ICreateTopicDto = { name: 'Child', content: 'Content', parentTopicId: 'unknown' };
      repositoryMock.findByTopicId.mockReturnValue([]);

      service.createTopic(dto);
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `Topic with ID: unknown not found`,
        expect.objectContaining({ serviceName: 'TopicService', serviceMethod: 'createTopic' }),
      );
    });
  });

  describe('updateTopic', () => {
    it('should update latest topic version', () => {
      const updateDto: IUpdateTopicDto = { name: 'Updated' };
      repositoryMock.findByTopicId.mockReturnValue([mockTopic]);
      repositoryMock.update.mockReturnValue({ ...mockTopic, name: 'Updated', version: 2 });

      const result = service.updateTopic('t1', updateDto);
      expect(repositoryMock.update).toHaveBeenCalledWith(mockTopic, updateDto);
      expect(result.name).toBe('Updated');
    });

    it('should select the latest topic version using reduce', () => {
      const t1 = { ...mockTopic, topicId: 't1', version: 2 };
      const t2 = { ...mockTopic, topicId: 't1', version: 3 };
      const t3 = { ...mockTopic, topicId: 't1', version: 1 };

      repositoryMock.findByTopicId.mockReturnValue([t1, t2, t3]);
      repositoryMock.update.mockImplementation((topic, dto) => ({ ...topic, ...dto, version: topic.version + 1 }));

      const updateDto: IUpdateTopicDto = { name: 'Updated' };
      const updated = service.updateTopic('t1', updateDto);

      expect(updated.name).toBe('Updated');
      expect(updated.version).toBe(t2.version + 1);
    });

    it('should throw notFoundException if topic does not exist', () => {
      repositoryMock.findByTopicId.mockReturnValue([]);

      service.updateTopic('t1', { name: 'X' });
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `Topic with ID: t1 not found`,
        expect.objectContaining({ serviceName: 'TopicService', serviceMethod: 'updateTopic' }),
      );
    });
  });

  describe('getTopic', () => {
    it('should return topic by version', () => {
      repositoryMock.findByTopicId.mockReturnValue([mockTopic]);

      const result = service.getTopic('t1', 1);
      expect(result).toBe(mockTopic);
    });

    it('should return topic tree if version not specified', () => {
      repositoryMock.getAll.mockReturnValue([mockTopic]);
      repositoryMock.findByTopicId.mockReturnValue([mockTopic]);
      resourceRepoMock.findByTopicId.mockReturnValue(undefined);

      const result = service.getTopic('t1');
      expect((result as ITreeNode).topicId).toBe('t1');
      expect((result as ITreeNode).children).toHaveLength(0);
      expect((result as ITreeNode).resource).toBeNull();
    });

    it('should replace topic in latestMap only if version is higher', () => {
      const t1 = { ...mockTopic, topicId: 't1', version: 1 };
      const t2 = { ...mockTopic, topicId: 't1', version: 2 };
      repositoryMock.getAll.mockReturnValue([t1, t2]);
      repositoryMock.findByTopicId.mockReturnValue([t2]);

      resourceRepoMock.findByTopicId.mockReturnValue(undefined);

      const result = service.getTopic('t1') as ITreeNode;
      expect(result.version).toBe(2);
    });

    it('should build children nodes and skip null nodes', () => {
      const parent = { ...mockTopic, topicId: 'parent', version: 1 };
      const child = { ...mockTopic, topicId: 'child', version: 1, parentTopicId: 'parent' };

      repositoryMock.getAll.mockReturnValue([parent, child]);
      repositoryMock.findByTopicId.mockImplementation((id) => (id === 'parent' ? [parent] : []));
      resourceRepoMock.findByTopicId.mockReturnValue(undefined);

      const result = service.getTopic('parent') as ITreeNode;

      expect(result.children.map((c: any) => c.topicId)).toEqual(['child']);
    });

    it('should cover else path of latestMap version comparison', () => {
      const t1 = { ...mockTopic, topicId: 't1', version: 3 };
      const t2 = { ...mockTopic, topicId: 't1', version: 2 };

      repositoryMock.findByTopicId.mockReturnValue([t1]);
      repositoryMock.getAll.mockReturnValue([t1, t2]);

      const result = service.getTopic('t1');
      expect(result.topicId).toBe('t1');
      expect(result.version).toBe(3);
    });

    it('should return null when buildNode finds no topic', () => {
      const t1 = { ...mockTopic, topicId: 't1', version: 3 };

      repositoryMock.findByTopicId.mockReturnValue([t1]);
      repositoryMock.getAll.mockReturnValue([]);

      const result = service.getTopic('t1');
      expect(result).toBe(undefined);
    });

    it('should throw notFoundException if topic not found', () => {
      repositoryMock.findByTopicId.mockReturnValue([]);
      service.getTopic('t1');
      expect(errorHandlerMock.notFoundException).toHaveBeenCalled();
    });

    it('should throw notFoundException if topic version not found', () => {
      repositoryMock.findByTopicId.mockReturnValue([mockTopic]);
      service.getTopic('t1', 999);
      expect(errorHandlerMock.notFoundException).toHaveBeenCalledWith(
        `Topic with version: 999 not found`,
        expect.objectContaining({ serviceName: 'TopicService', serviceMethod: 'getTopic' }),
      );
    });
  });

  describe('getTopicsPaginated', () => {
    it('should return paginated topics', () => {
      const topics = Array.from({ length: 15 }, (_, i) => ({ ...mockTopic, topicId: `t${i}` }));
      repositoryMock.findLatestVersions.mockReturnValue(topics);

      const result = service.getTopicsPaginated(2, 5);
      expect(result.metadata.total).toBe(15);
      expect(result.metadata.page).toBe(2);
      expect(result.metadata.limit).toBe(5);
      expect(result.data[0].topicId).toBe('t5');
    });
  });

  describe('deleteTopic', () => {
    it('should delete topic and its resources', () => {
      const childTopic = { ...mockTopic, topicId: 't2', parentTopicId: 't1' };
      repositoryMock.getAll.mockReturnValue([mockTopic, childTopic]);
      resourceRepoMock.deleteByTopicId.mockReturnValue(1);

      const result = service.deleteTopic('t1');
      expect(repositoryMock.deleteByIds).toHaveBeenCalledWith(new Set(['t1', 't2']));
      expect(result.deleted).toBe(2);
    });
  });

  describe('shortestPath', () => {
    it('should return path between topics', () => {
      const t1 = { ...mockTopic, topicId: 't1' };
      const t2 = { ...mockTopic, topicId: 't2', parentTopicId: 't1' };
      repositoryMock.findLatestVersions.mockReturnValue([t1, t2]);

      const path = service.shortestPath('t1', 't2');
      expect(path).toEqual(['t1', 't2']);
    });

    it('should return empty if no path', () => {
      repositoryMock.findLatestVersions.mockReturnValue([mockTopic]);
      const path = service.shortestPath('t1', 't2');
      expect(path).toEqual([]);
    });

    it('should cover else path for addEdge when adj already has nodes', () => {
      repositoryMock.findLatestVersions.mockReturnValue([
        { content: '', id: '', name: '', createdAt: '', topicId: 'a', parentTopicId: 'b', version: 1 },
        { content: '', id: '', name: '', createdAt: '', topicId: 'a', parentTopicId: 'b', version: 2 },
      ]);

      const path = service.shortestPath('a', 'b');
      expect(path).toEqual(['a', 'b']);
    });

    it('should return array with single topic if same', () => {
      const path = service.shortestPath('t1', 't1');
      expect(path).toEqual(['t1']);
    });

    it('should skip already visited neighbors', () => {
      repositoryMock.findLatestVersions.mockReturnValue([
        { content: '', id: '', name: '', createdAt: '', topicId: 'a', parentTopicId: 'b', version: 1 },
        { content: '', id: '', name: '', createdAt: '', topicId: 'b', parentTopicId: 'c', version: 1 },
        { content: '', id: '', name: '', createdAt: '', topicId: 'c', parentTopicId: undefined, version: 1 },
      ]);

      const path = service.shortestPath('a', 'c');
      expect(path).toEqual(['a', 'b', 'c']);
    });

    it('should traverse neighbors without hitting toTopicId immediately', () => {
      repositoryMock.findLatestVersions.mockReturnValue([
        { content: '', id: '', name: '', createdAt: '', topicId: 'a', parentTopicId: 'b', version: 1 },
        { content: '', id: '', name: '', createdAt: '', topicId: 'b', parentTopicId: 'c', version: 1 },
        { content: '', id: '', name: '', createdAt: '', topicId: 'c', parentTopicId: 'a', version: 1 },
      ]);

      const path = service.shortestPath('a', 'c');
      expect(path).toEqual(['a', 'c']);
    });
  });

  describe('listVersions', () => {
    it('should return sorted versions', () => {
      const v1 = { ...mockTopic, version: 1 };
      const v2 = { ...mockTopic, version: 2 };
      repositoryMock.findByTopicId.mockReturnValue([v2, v1]);

      const result = service.listVersions('t1');
      expect(result[0].version).toBe(1);
      expect(result[1].version).toBe(2);
    });
  });
});
