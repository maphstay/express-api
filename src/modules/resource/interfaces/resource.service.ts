import { IPaginatedResponse } from '@bases/paginated';
import { ICreateResourceDto } from '../dto/createResource.dto';
import { IUpdateResourceDto } from '../dto/updateResource.dto';
import { IResource, Resource } from '../resource.entity';

export abstract class IResourceService {
  abstract createResource(createResourceDto: ICreateResourceDto): IResource;
  abstract updateResource(id: string, updateResourceDto: IUpdateResourceDto): IResource;
  abstract getResource(id: string): IResource;
  abstract getResourcesPaginated(page?: number, limit?: number): IPaginatedResponse<typeof Resource>;
  abstract deleteResource(id: string): IResource;
}
