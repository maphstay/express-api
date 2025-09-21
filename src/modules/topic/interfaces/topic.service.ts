import { ICreateTopicDto } from '../dto/createTopic.dto';
import { TopicVersion } from '../topic.entity';

export abstract class ITopicService {
  abstract createTopic(createTopicDto: ICreateTopicDto): TopicVersion;
  abstract updateTopic(
    topicId: string,
    params: { name?: string; content?: string; parentTopicId?: string },
  ): TopicVersion;
  abstract getTopic(topicId: string, version?: number): TopicVersion;
  abstract getTopicsPaginated(
    page?: number,
    limit?: number,
  ): {
    metadata: { total: number; page: number; limit: number; totalPages: number };
    data: TopicVersion[];
  };
  abstract deleteTopic(topicId: string): { deleted: number };
  abstract shortestPath(fromTopicId: string, toTopicId: string): string[];
  abstract listVersions(topicId: string): TopicVersion[];
}
