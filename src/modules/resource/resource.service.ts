import { IResource, Resource } from './resource.entity';
import { IResourceRepository } from './interfaces/resource.repository';
import { IResourceService } from './interfaces/resource.service';
import { ICreateResourceDto } from './dto/createResource.dto';
import { IUpdateResourceDto } from './dto/updateResource.dto';
import { IErrorHandlingService } from '@errors/interfaces/errorHandling.service';
import { ITopicRepository } from '@modules/topic/interfaces/topic.repository';
import { IPaginatedResponse } from '@bases/paginated';

export class ResourceService implements IResourceService {
  constructor(
    private repository: IResourceRepository,
    private topicRepository: ITopicRepository,
    private errorHandler: IErrorHandlingService,
  ) {}

  public createResource(createResourceDto: ICreateResourceDto): IResource {
    const topicVersions = this.topicRepository.findByTopicId(createResourceDto.topicId);

    if (!topicVersions.length)
      return this.errorHandler.notFoundException(`Resource with ID: ${createResourceDto.topicId} not found`, {
        serviceName: ResourceService.name,
        serviceMethod: this.createResource.name,
      });

    return this.repository.add(createResourceDto);
  }

  public updateResource(id: string, updateResourceDto: IUpdateResourceDto): IResource {
    const { resource, index } = this.repository.findByIdWithIndex(id);

    if (!resource)
      return this.errorHandler.notFoundException(`Resource with ID: ${id} not found`, {
        serviceName: ResourceService.name,
        serviceMethod: this.getResource.name,
      });

    return this.repository.updateByIndex(index, updateResourceDto);
  }

  public getResource(id: string): IResource {
    const { resource } = this.repository.findByIdWithIndex(id);

    if (!resource)
      return this.errorHandler.notFoundException(`Resource with ID: ${id} not found`, {
        serviceName: ResourceService.name,
        serviceMethod: this.getResource.name,
      });

    return resource;
  }

  public getResourcesPaginated(page: number = 1, limit: number = 10): IPaginatedResponse<typeof Resource> {
    const allLatest = this.repository.getAll();
    const total = allLatest.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = allLatest.slice(start, end);

    return {
      metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data,
    };
  }

  public deleteResource(id: string): IResource {
    const { resource, index } = this.repository.findByIdWithIndex(id);

    if (!resource)
      return this.errorHandler.notFoundException(`Resource with ID: ${id} not found`, {
        serviceName: ResourceService.name,
        serviceMethod: this.deleteResource.name,
      });

    this.repository.deleteByIndex(index);

    return resource;
  }
}
