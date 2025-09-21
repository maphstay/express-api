import { ICreateTopicDto } from '../dto/createTopic.dto';
import { IUpdateTopicDto } from '../dto/updateTopic.dto';
import { TopicVersion } from '../topic.entity';

export abstract class ITopicRepository {
  abstract getAll(): TopicVersion[];
  abstract saveAll(topicVersions: TopicVersion[]): void;
  abstract add(createTopicDto: ICreateTopicDto): TopicVersion;
  abstract update(latestTopic: TopicVersion, updateTopicDto: IUpdateTopicDto): TopicVersion;
  abstract findByTopicId(topicId: string): TopicVersion[];
  abstract findLatestVersions(): TopicVersion[];
  abstract deleteByIds(ids: Set<string>): void;
}
