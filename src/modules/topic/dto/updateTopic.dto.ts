import { ICreateTopicDto } from './createTopic.dto';

export interface IUpdateTopicDto extends Partial<Omit<ICreateTopicDto, 'parentTopicId'>> {}
