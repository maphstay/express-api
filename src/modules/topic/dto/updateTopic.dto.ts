import { z } from 'zod';
import { CreateTopicDto } from './createTopic.dto';

export const UpdateTopicDto = CreateTopicDto.omit({ parentTopicId: true }).partial();

export type IUpdateTopicDto = z.infer<typeof UpdateTopicDto>;
