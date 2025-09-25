import { ICreateTopicDto } from '../dto/createTopic.dto';
import { IUpdateTopicDto } from '../dto/updateTopic.dto';
import { ITopicVersion } from '../topic.entity';

export abstract class ITopicRepository {
  abstract getAll(): ITopicVersion[];
  abstract add(createTopicDto: ICreateTopicDto): ITopicVersion;
  abstract update(latestTopic: ITopicVersion, updateTopicDto: IUpdateTopicDto): ITopicVersion;
  abstract findByTopicId(topicId: string): ITopicVersion[];
  abstract findLatestVersions(): ITopicVersion[];
  abstract deleteByIds(ids: Set<string>): void;
}
