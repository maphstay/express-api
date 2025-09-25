import { ICreateResourceDto } from '../dto/createResource.dto';
import { IUpdateResourceDto } from '../dto/updateResource.dto';
import { IResource } from '../resource.entity';

export abstract class IResourceRepository {
  abstract getAll(): IResource[];
  abstract add(createResourceDto: ICreateResourceDto): IResource;
  abstract updateByIndex(index: number, updateResourceDto: IUpdateResourceDto): IResource;
  abstract findByIdWithIndex(id: string): { resource: IResource | undefined; index: number };
  abstract findByTopicId(topicId: string): IResource | undefined;
  abstract deleteByIndex(index: number): void;
  abstract deleteByTopicId(topicId: string): number;
}
