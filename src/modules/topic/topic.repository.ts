import { v4 as uuid } from 'uuid';
import { ITopicRepository } from './interfaces/topic.repository';
import { ITopicVersion } from './topic.entity';
import { readDB, writeDB } from '@database/jsonDb';
import { ICreateTopicDto } from './dto/createTopic.dto';
import { now } from '@utils/nowGenerateDate';
import { IUpdateTopicDto } from './dto/updateTopic.dto';

export class TopicRepository implements ITopicRepository {
  public getAll(): ITopicVersion[] {
    const db = readDB();
    return [...db.topicVersions];
  }

  public add(createTopicDto: ICreateTopicDto): ITopicVersion {
    const db = readDB();
    const logicalId = uuid();
    const createdVersionObj: ITopicVersion = {
      id: uuid(),
      topicId: logicalId,
      name: createTopicDto.name,
      content: createTopicDto.content,
      version: 1,
      parentTopicId: createTopicDto.parentTopicId,
      createdAt: now(),
      updatedAt: now(),
    };
    db.topicVersions.push(createdVersionObj);
    writeDB(db);
    return createdVersionObj;
  }

  public update(latestTopic: ITopicVersion, updateTopicDto: IUpdateTopicDto): ITopicVersion {
    const db = readDB();
    const updatedVersion: ITopicVersion = {
      id: uuid(),
      topicId: latestTopic.topicId,
      name: updateTopicDto.name ?? latestTopic.name,
      content: updateTopicDto.content ?? latestTopic.content,
      version: latestTopic.version + 1,
      parentTopicId: latestTopic.parentTopicId,
      createdAt: latestTopic.createdAt,
      updatedAt: now(),
    };
    db.topicVersions.push(updatedVersion);
    writeDB(db);
    return updatedVersion;
  }

  public findByTopicId(topicId: string): ITopicVersion[] {
    const db = readDB();
    return db.topicVersions.filter((tv) => tv.topicId === topicId);
  }

  public findLatestVersions(): ITopicVersion[] {
    const db = readDB();
    const map = new Map<string, ITopicVersion>();
    db.topicVersions.forEach((tv) => {
      const cur = map.get(tv.topicId);
      if (!cur || tv.version > cur.version) map.set(tv.topicId, tv);
    });
    return Array.from(map.values());
  }

  public deleteByIds(ids: Set<string>): void {
    const db = readDB();
    db.topicVersions = db.topicVersions.filter((tv) => !ids.has(tv.topicId));
    writeDB(db);
  }
}
