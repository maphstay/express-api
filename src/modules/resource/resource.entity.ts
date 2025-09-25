import { z } from 'zod';

export enum ResourceType {
  VIDEO = 'video',
  ARTICLE = 'article',
  PDF = 'pdf',
  PRESENTATION = 'presentation',
  AUDIO = 'audio',
  IMAGE = 'image',
  OTHER = 'other',
}

export const Resource = z
  .object({
    id: z
      .uuid()
      .meta({ description: 'Unique identifier of the resource', example: '550e8400-e29b-41d4-a716-446655440000' }),
    topicId: z
      .uuid()
      .meta({ description: 'ID of the associated topic', example: '660e8400-e29b-41d4-a716-446655440111' }),
    url: z.url().meta({ description: 'URL of the resource', example: 'https://example.com/resource.pdf' }),
    description: z
      .string()
      .meta({ description: 'Description of the resource', example: 'PDF containing chapter 1 content' }),
    type: z
      .enum(ResourceType, { error: `Role must be one of: ${Object.values(ResourceType).join(', ')}` })
      .meta({ example: ResourceType.PDF }),
    createdAt: z.iso.date().meta({ description: 'Creation timestamp', example: '2025-09-24T12:00:00Z' }),
    updatedAt: z.iso.date().optional().meta({ description: 'Last update timestamp', example: '2025-09-25T12:00:00Z' }),
  })
  .meta({ id: 'ResourceEntity', description: 'Resource model' });

export type IResource = z.infer<typeof Resource>;
