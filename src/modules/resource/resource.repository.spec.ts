import { ResourceRepository } from './resource.repository';
import * as jsonDb from '@database/jsonDb';
import { ICreateResourceDto } from './dto/createResource.dto';
import { IUpdateResourceDto } from './dto/updateResource.dto';
import { DBData } from '@database/jsonDb';
import { ResourceType } from './resource.entity';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('@utils/nowGenerateDate', () => ({
  now: jest.fn(() => '2025-09-24T00:00:00.000Z'),
}));

describe('ResourceRepository', () => {
  let repository: ResourceRepository;
  let dbMock: DBData;

  beforeEach(() => {
    repository = new ResourceRepository();
    dbMock = { topicVersions: [], resources: [], users: [] };

    jest.spyOn(jsonDb, 'readDB').mockImplementation(() => dbMock);
    jest.spyOn(jsonDb, 'writeDB').mockImplementation((db) => {
      dbMock = db;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return all resources with getAll', () => {
    const dto: ICreateResourceDto = { topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO };
    repository.add(dto);
    repository.add({ ...dto, topicId: 't2' });

    const all = repository.getAll();
    expect(all).toHaveLength(2);
    expect(all).toEqual(dbMock.resources);
  });

  it('should add a resource', () => {
    const dto: ICreateResourceDto = { topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO };
    const result = repository.add(dto);

    expect(result).toEqual({
      id: 'mock-uuid',
      topicId: 't1',
      description: 'D1',
      url: 'url1',
      type: 'video',
      createdAt: '2025-09-24T00:00:00.000Z',
      updatedAt: '2025-09-24T00:00:00.000Z',
    });

    expect(dbMock.resources.length).toBe(1);
    expect(jsonDb.writeDB).toHaveBeenCalledWith(dbMock);
  });

  it('should find resource by id with index', () => {
    const dto: ICreateResourceDto = { topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO };
    const added = repository.add(dto);

    const { resource, index } = repository.findByIdWithIndex(added.id);
    expect(resource).toEqual(added);
    expect(index).toBe(0);
  });

  it('should return undefined and index -1 when findByIdWithIndex does not exist', () => {
    const result = repository.findByIdWithIndex('non-existing-id');
    expect(result.resource).toBeUndefined();
    expect(result.index).toBe(-1);
  });

  it('should find resource by topicId', () => {
    const dto: ICreateResourceDto = { topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO };
    const added = repository.add(dto);

    const found = repository.findByTopicId('t1');
    expect(found).toEqual(added);
  });

  it('should return undefined when findByTopicId does not exist', () => {
    const found = repository.findByTopicId('non-existing-topic');
    expect(found).toBeUndefined();
  });

  it('should update resource by index', () => {
    const dto: ICreateResourceDto = { topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO };
    repository.add(dto);

    const updateDto: IUpdateResourceDto = { description: 'D2', url: 'url2', type: ResourceType.AUDIO };
    const updated = repository.updateByIndex(0, updateDto);

    expect(updated.description).toBe('D2');
    expect(updated.url).toBe('url2');
    expect(updated.type).toBe('audio');
    expect(updated.updatedAt).toBe('2025-09-24T00:00:00.000Z');
  });

  it('should fallback to current values when updateResourceDto fields are undefined', () => {
    const dto: ICreateResourceDto = { topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO };
    repository.add(dto);

    const updateDto: IUpdateResourceDto = {};
    const updated = repository.updateByIndex(0, updateDto);

    expect(updated.description).toBe('D1');
    expect(updated.url).toBe('url1');
    expect(updated.type).toBe('video');
  });

  it('should delete resource by index', () => {
    const dto: ICreateResourceDto = { topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO };
    repository.add(dto);

    repository.deleteByIndex(0);
    expect(dbMock.resources.length).toBe(0);
  });

  it('should delete resources by topicId', () => {
    repository.add({ topicId: 't1', description: 'D1', url: 'url1', type: ResourceType.VIDEO });
    repository.add({ topicId: 't1', description: 'D2', url: 'url2', type: ResourceType.AUDIO });
    repository.add({ topicId: 't2', description: 'D3', url: 'url3', type: ResourceType.VIDEO });

    const deletedCount = repository.deleteByTopicId('t1');

    expect(deletedCount).toBe(2);
    expect(dbMock.resources).toHaveLength(1);
    expect(dbMock.resources[0].topicId).toBe('t2');
  });
});
