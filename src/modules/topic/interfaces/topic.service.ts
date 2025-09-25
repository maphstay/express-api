import { IPaginatedResponse } from '@bases/paginated';
import { ICreateTopicDto } from '../dto/createTopic.dto';
import { IUpdateTopicDto } from '../dto/updateTopic.dto';
import { ITopicVersion, ITreeNode, TopicVersion } from '../topic.entity';

export abstract class ITopicService {
  abstract createTopic(createTopicDto: ICreateTopicDto): ITopicVersion;
  abstract updateTopic(topicId: string, updateTopicDto: IUpdateTopicDto): ITopicVersion;
  abstract getTopic(topicId: string, version?: number): ITopicVersion | ITreeNode;
  abstract getTopicsPaginated(page?: number, limit?: number): IPaginatedResponse<typeof TopicVersion>;
  abstract deleteTopic(topicId: string): { deleted: number };
  abstract shortestPath(fromTopicId: string, toTopicId: string): string[];
  abstract listVersions(topicId: string): ITopicVersion[];
}
