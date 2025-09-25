import { TopicRepository } from './topic.repository';
import * as jsonDb from '@database/jsonDb';
import { DBData } from '@database/jsonDb';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('TopicRepository', () => {
  let repository: TopicRepository;
  let dbMock: DBData;

  beforeEach(() => {
    repository = new TopicRepository();
    dbMock = { topicVersions: [], resources: [], users: [] };

    jest.spyOn(jsonDb, 'readDB').mockImplementation(() => dbMock);
    jest.spyOn(jsonDb, 'writeDB').mockImplementation((db) => {
      dbMock = db;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return all topics with getAll', () => {
    repository.add({ name: 'T1', content: 'C1' });
    repository.add({ name: 'T2', content: 'C2' });
    const all = repository.getAll();
    expect(all).toHaveLength(2);
    expect(all).toEqual(dbMock.topicVersions);
  });

  it('should add a topic', () => {
    const result = repository.add({ name: 'Test', content: 'Content', parentTopicId: undefined });

    expect(result).toEqual({
      id: 'mock-uuid',
      topicId: 'mock-uuid',
      name: 'Test',
      content: 'Content',
      version: 1,
      parentTopicId: undefined,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    expect(dbMock.topicVersions.length).toBe(1);
    expect(jsonDb.writeDB).toHaveBeenCalledWith(dbMock);
  });

  it('should find topic by id', () => {
    const topic = repository.add({ name: 'Test', content: 'Content', parentTopicId: undefined });
    const found = repository.findByTopicId(topic.topicId);

    expect(found).toHaveLength(1);
    expect(found[0].topicId).toBe(topic.topicId);
  });

  it('should update topic', () => {
    const topic = repository.add({ name: 'Test', content: 'Content', parentTopicId: undefined });
    const updated = repository.update(topic, { name: 'Updated' });

    expect(updated.version).toBe(topic.version + 1);
    expect(updated.name).toBe('Updated');
    expect(updated.content).toBe(topic.content);
    expect(dbMock.topicVersions.length).toBe(2);
  });

  it('should fallback to latestTopic.name when updateTopicDto.name is undefined', () => {
    const t1 = repository.add({ name: 'Original', content: 'C1' });
    const updated = repository.update(t1, { content: 'New content' });

    expect(updated.name).toBe(t1.name);
    expect(updated.content).toBe('New content');
    expect(updated.version).toBe(t1.version + 1);
  });

  it('should return latest versions', () => {
    const t1 = repository.add({ name: 'A', content: 'C1' });
    repository.update(t1, { name: 'A Updated' });

    const latest = repository.findLatestVersions();
    expect(latest).toHaveLength(1);
    expect(latest[0].name).toBe('A Updated');
  });

  it('should cover else path in findLatestVersions', () => {
    const t1 = repository.add({ name: 'A', content: 'C1' });
    const t2 = { ...t1, version: 1 };
    dbMock.topicVersions.push(t2);

    const latest = repository.findLatestVersions();

    expect(latest).toHaveLength(1);
    expect(latest[0].topicId).toBe(t1.topicId);
  });

  it('should delete by ids', () => {
    const t1 = repository.add({ name: 'A', content: 'C1' });
    repository.deleteByIds(new Set([t1.topicId]));

    expect(dbMock.topicVersions.length).toBe(0);
  });
});
