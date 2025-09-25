import { Resource } from '@modules/resource/resource.entity';
import { z } from 'zod';

export const TopicVersion = z
  .object({
    id: z
      .uuid()
      .meta({ description: 'Unique identifier of the topic version', example: '550e8400-e29b-41d4-a716-446655440000' }),
    topicId: z
      .uuid()
      .meta({ description: 'ID of the associated topic', example: '660e8400-e29b-41d4-a716-446655440111' }),
    name: z.string().meta({ description: 'Name of the topic', example: 'Introduction to Algebra' }),
    content: z
      .string()
      .meta({ description: 'Content of the topic', example: 'This chapter covers basic algebra concepts...' }),
    version: z.number().int().meta({ description: 'Version number of the topic', example: 1 }),
    parentTopicId: z
      .uuid()
      .optional()
      .meta({ description: 'ID of the parent topic if exists', example: '770e8400-e29b-41d4-a716-446655440222' }),
    createdAt: z.iso.datetime().meta({ description: 'Creation timestamp', example: '2025-09-24T12:00:00Z' }),
    updatedAt: z.iso
      .datetime()
      .optional()
      .meta({ description: 'Last update timestamp', example: '2025-09-25T12:00:00Z' }),
  })
  .meta({ id: 'TopicVersionEntity', description: 'Topic version model' });

export type ITopicVersion = z.infer<typeof TopicVersion>;

export const TreeNode: z.ZodType<any> = z
  .lazy(() =>
    TopicVersion.extend({
      children: z.array(TreeNode).meta({ description: 'Child topics of this node' }),
      resource: Resource.nullable().meta({ description: 'Associated resource, if any' }),
    }),
  )
  .meta({ id: 'TreeNodeEntity', description: 'Tree node model representing a topic and its hierarchy' });

export type ITreeNode = z.infer<typeof TreeNode>;
