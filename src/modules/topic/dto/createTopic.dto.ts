import { z } from 'zod';

export const CreateTopicDto = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  parentTopicId: z.uuid('Parent topic ID must be a valid UUID').optional(),
});

export type ICreateTopicDto = z.infer<typeof CreateTopicDto>;
