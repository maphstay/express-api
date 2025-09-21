import { TopicVersion } from './topic.entity';
import { ITopicRepository } from './interfaces/topic.repository';
import { ITopicService } from './interfaces/topic.service';
import { ICreateTopicDto } from './dto/createTopic.dto';
import { IUpdateTopicDto } from './dto/updateTopic.dto';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';

export class TopicService implements ITopicService {
  constructor(
    private repository: ITopicRepository,
    private errorHandler: IErrorHandlingService,
  ) {}

  createTopic(createTopicDto: ICreateTopicDto): TopicVersion {
    if (createTopicDto.parentTopicId) {
      const parentTopic = this.repository.findByTopicId(createTopicDto.parentTopicId);
      if (!parentTopic.length)
        return this.errorHandler.notFoundException(`Topic with ID: ${createTopicDto.parentTopicId} not found`, {
          serviceName: TopicService.name,
          serviceMethod: this.createTopic.name,
        });
    }
    return this.repository.add(createTopicDto);
  }

  updateTopic(topicId: string, updateTopicDto: IUpdateTopicDto) {
    const versions = this.repository.findByTopicId(topicId);
    if (!versions.length)
      return this.errorHandler.notFoundException(`Topic with ID: ${topicId} not found`, {
        serviceName: TopicService.name,
        serviceMethod: this.updateTopic.name,
      });

    const latestTopic = versions.reduce((a, b) => (a.version > b.version ? a : b));

    return this.repository.update(latestTopic, updateTopicDto);
  }

  getTopic(topicId: string, version?: number) {
    const versions = this.repository.findByTopicId(topicId);
    if (!versions.length)
      return this.errorHandler.notFoundException(`Topic with ID: ${topicId} not found`, {
        serviceName: TopicService.name,
        serviceMethod: this.getTopic.name,
      });

    if (version) {
      const v = versions.find((tv) => tv.version === version);
      if (!v)
        return this.errorHandler.notFoundException(`Topic with version: ${version} not found`, {
          serviceName: TopicService.name,
          serviceMethod: this.getTopic.name,
        });
      return v;
    }

    const latestMap = new Map<string, TopicVersion>();
    this.repository.getAll().forEach((tv) => {
      const cur = latestMap.get(tv.topicId);
      if (!cur || tv.version > cur.version) latestMap.set(tv.topicId, tv);
    });

    const buildNode = (tid: string): (TopicVersion & { children: any[] }) | null => {
      const tv = latestMap.get(tid);
      if (!tv) return null;

      const children = Array.from(latestMap.values())
        .filter((ch) => ch.parentTopicId === tid)
        .map((ch) => buildNode(ch.topicId))
        .filter((c): c is TopicVersion & { children: any[] } => c !== null);

      return { ...tv, children };
    };

    const root = buildNode(topicId);
    if (!root)
      return this.errorHandler.notFoundException(`Topic with ID: ${topicId} not found`, {
        serviceName: TopicService.name,
        serviceMethod: this.getTopic.name,
      });
    return root;
  }

  getTopicsPaginated(page: number = 1, limit: number = 10) {
    const allLatest = this.repository.findLatestVersions();
    const total = allLatest.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = allLatest.slice(start, end);

    return {
      metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data,
    };
  }

  deleteTopic(topicId: string) {
    const allVersions = this.repository.getAll();
    const idsToDelete = new Set<string>();
    const queue = [topicId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      idsToDelete.add(currentId);

      queue.push(
        ...allVersions
          .filter((tv) => tv.parentTopicId === currentId && !idsToDelete.has(tv.topicId))
          .map((tv) => tv.topicId),
      );
    }

    const beforeCount = allVersions.length;
    this.repository.deleteByIds(idsToDelete);

    return { deleted: beforeCount - this.repository.getAll().length };
  }

  shortestPath(fromTopicId: string, toTopicId: string): string[] {
    if (fromTopicId === toTopicId) return [fromTopicId];

    const nodes = this.repository.findLatestVersions();

    const adj = new Map<string, Set<string>>();
    const addEdge = (a: string, b: string) => {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a)!.add(b);
      adj.get(b)!.add(a);
    };

    nodes.forEach((n) => {
      if (n.parentTopicId) addEdge(n.topicId, n.parentTopicId);
    });

    const queue: string[] = [fromTopicId];
    const visited = new Set<string>([fromTopicId]);
    const parent = new Map<string, string | null>();
    parent.set(fromTopicId, null);

    while (queue.length) {
      const cur = queue.shift()!;
      const neighbors = adj.get(cur) ?? new Set();
      for (const nb of neighbors) {
        if (!visited.has(nb)) {
          visited.add(nb);
          parent.set(nb, cur);
          queue.push(nb);
          if (nb === toTopicId) {
            const path: string[] = [];
            let p: string | null = toTopicId;
            while (p) {
              path.push(p);
              p = parent.get(p) ?? null;
            }
            return path.reverse();
          }
        }
      }
    }

    return [];
  }

  listVersions(topicId: string) {
    return this.repository.findByTopicId(topicId).sort((a, b) => a.version - b.version);
  }
}
