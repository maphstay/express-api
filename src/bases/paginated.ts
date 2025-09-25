import { z } from 'zod';

const PaginationMetadata = z
  .object({
    total: z.number().meta({ description: 'Total number of records', example: 42 }),
    page: z.number().meta({ description: 'Current page number', example: 1 }),
    limit: z.number().meta({ description: 'Maximum records per page', example: 10 }),
    totalPages: z.number().meta({ description: 'Total number of pages', example: 5 }),
  })
  .meta({ id: 'PaginationMetadata', description: 'Pagination details' });

export const PaginatedResponse = <T extends z.ZodTypeAny>(schema: T, name: string) =>
  z
    .object({
      metadata: PaginationMetadata,
      data: z.array(schema).meta({ description: 'List of records for the current page' }),
    })
    .meta({ id: `Paginated${name}`, description: `Paginated response of ${name}` });

export type IPaginatedResponse<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof PaginatedResponse<T>>>;
