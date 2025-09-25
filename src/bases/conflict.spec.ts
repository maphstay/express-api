import { z } from 'zod';
import { ConflictResponse } from './conflict';

describe('ConflictResponse schema', () => {
  it('should return a valid Zod schema with the provided message', () => {
    const message = 'Resource already exists';
    const response = ConflictResponse(message);
    const schema = response.content['application/json'].schema;

    expect(response.description).toBe('Conflict');
    expect(schema).toBeInstanceOf(z.ZodObject);

    const parsed = schema.parse({});
    expect(parsed.status).toBe(409);
    expect(parsed.message).toBe(message);

    const parsedOverride = schema.parse({ status: 410, message: 'Another conflict' });
    expect(parsedOverride.status).toBe(410);
    expect(parsedOverride.message).toBe('Another conflict');
  });
});
