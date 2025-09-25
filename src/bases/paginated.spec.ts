import { z } from 'zod';
import { PaginatedResponse } from './paginated';

describe('PaginatedResponse schema', () => {
  const ItemSchema = z.object({ id: z.string(), name: z.string() });

  it('should create a valid paginated response schema', () => {
    const Schema = PaginatedResponse(ItemSchema, 'Item');
    expect(Schema).toBeInstanceOf(z.ZodObject);

    const sampleData = {
      metadata: { total: 100, page: 2, limit: 10, totalPages: 10 },
      data: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ],
    };

    const parsed = Schema.parse(sampleData);
    expect(parsed.metadata.total).toBe(100);
    expect(parsed.metadata.page).toBe(2);
    expect(parsed.metadata.limit).toBe(10);
    expect(parsed.metadata.totalPages).toBe(10);
    expect(parsed.data).toHaveLength(2);
    expect(parsed.data[0].id).toBe('1');
  });

  it('should throw if metadata is invalid', () => {
    const Schema = PaginatedResponse(ItemSchema, 'Item 1');
    const invalidData = {
      metadata: { total: 'wrong', page: 1, limit: 10, totalPages: 5 },
      data: [],
    };
    expect(() => Schema.parse(invalidData)).toThrow();
  });

  it('should throw if data items are invalid', () => {
    const Schema = PaginatedResponse(ItemSchema, 'Item 2');
    const invalidData = {
      metadata: { total: 0, page: 1, limit: 10, totalPages: 1 },
      data: [{ id: 1, name: 'Invalid' }],
    };
    expect(() => Schema.parse(invalidData)).toThrow();
  });
});
