import { z } from 'zod';
import { UnauthorizedResponse } from './unauthorized';

describe('UnauthorizedResponse schema', () => {
  it('should return a valid Zod schema with default values', () => {
    const schema = UnauthorizedResponse.content['application/json'].schema;

    expect(UnauthorizedResponse.description).toBe('Unauthorized');
    expect(schema).toBeInstanceOf(z.ZodObject);

    const parsed = schema.parse({});
    expect(parsed.status).toBe(401);
    expect(parsed.message).toBe('Unauthorized');

    const parsedOverride = schema.parse({ status: 403, message: 'Forbidden' });
    expect(parsedOverride.status).toBe(403);
    expect(parsedOverride.message).toBe('Forbidden');
  });
});
