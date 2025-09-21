import { v4 as uuid } from 'uuid';
import { ITopicRepository } from './interfaces/topic.repository';
import { TopicVersion } from './topic.entity';
import { readDB, writeDB } from '@database/jsonDb';
import { ICreateTopicDto } from './dto/createTopic.dto';
import { now } from '@utils/nowGenerateDate';
import { IUpdateTopicDto } from './dto/updateTopic.dto';

export class TopicRepository implements ITopicRepository {
  getAll(): TopicVersion[] {
    const db = readDB();
    return [...db.topicVersions];
  }

  saveAll(topicVersions: TopicVersion[]) {
    const db = readDB();
    db.topicVersions = topicVersions;
    writeDB(db);
  }

  add(createTopicDto: ICreateTopicDto): TopicVersion {
    const db = readDB();
    const logicalId = uuid();
    const createdVersionObj: TopicVersion = {
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

  update(latestTopic: TopicVersion, updateTopicDto: IUpdateTopicDto): TopicVersion {
    const db = readDB();
    const updatedVersion: TopicVersion = {
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

  findByTopicId(topicId: string): TopicVersion[] {
    const db = readDB();
    return db.topicVersions.filter((tv) => tv.topicId === topicId);
  }

  findLatestVersions(): TopicVersion[] {
    const db = readDB();
    const map = new Map<string, TopicVersion>();
    db.topicVersions.forEach((tv) => {
      const cur = map.get(tv.topicId);
      if (!cur || tv.version > cur.version) map.set(tv.topicId, tv);
    });
    return Array.from(map.values());
  }

  deleteByIds(ids: Set<string>) {
    const db = readDB();
    db.topicVersions = db.topicVersions.filter((tv) => !ids.has(tv.topicId));
    writeDB(db);
  }
}
