import { v4 as uuid } from 'uuid';
import { IResourceRepository } from './interfaces/resource.repository';
import { IResource } from './resource.entity';
import { readDB, writeDB } from '@database/jsonDb';
import { ICreateResourceDto } from './dto/createResource.dto';
import { now } from '@utils/nowGenerateDate';
import { IUpdateResourceDto } from './dto/updateResource.dto';

export class ResourceRepository implements IResourceRepository {
  public getAll(): IResource[] {
    const db = readDB();
    return [...db.resources];
  }

  public add(createResourceDto: ICreateResourceDto): IResource {
    const db = readDB();
    const createdObj: IResource = {
      id: uuid(),
      topicId: createResourceDto.topicId,
      description: createResourceDto.description,
      url: createResourceDto.url,
      type: createResourceDto.type,
      createdAt: now(),
      updatedAt: now(),
    };
    db.resources.push(createdObj);
    writeDB(db);
    return createdObj;
  }

  public updateByIndex(index: number, updateResourceDto: IUpdateResourceDto): IResource {
    const db = readDB();

    db.resources[index] = {
      ...db.resources[index],
      description: updateResourceDto.description ?? db.resources[index].description,
      url: updateResourceDto.url ?? db.resources[index].url,
      type: updateResourceDto.type ?? db.resources[index].type,
      updatedAt: now(),
    };

    writeDB(db);
    return db.resources[index];
  }

  public findByIdWithIndex(id: string): { resource: IResource | undefined; index: number } {
    const db = readDB();
    const index = db.resources.findIndex((r) => r.id === id);
    const resource = index !== -1 ? db.resources[index] : undefined;
    return { resource, index };
  }

  public findByTopicId(topicId: string): IResource | undefined {
    const db = readDB();
    return db.resources.find((r) => r.topicId === topicId);
  }

  public deleteByIndex(index: number): void {
    const db = readDB();
    db.resources.splice(index, 1);
    writeDB(db);
  }

  public deleteByTopicId(topicId: string): number {
    const db = readDB();
    const beforeCount = db.resources.length;

    db.resources = db.resources.filter((r) => r.topicId !== topicId);

    writeDB(db);

    return beforeCount - db.resources.length;
  }
}
