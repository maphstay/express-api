import { z } from 'zod';
import { ForbiddenResponse } from './forbidden';

describe('ForbiddenResponse schema', () => {
  it('should return a valid Zod schema with the provided message', () => {
    const message = 'Access denied';
    const response = ForbiddenResponse(message);
    const schema = response.content['application/json'].schema;

    expect(response.description).toBe('Forbidden');
    expect(schema).toBeInstanceOf(z.ZodObject);

    const parsed = schema.parse({});
    expect(parsed.status).toBe(403);
    expect(parsed.message).toBe(message);

    const parsedOverride = schema.parse({ status: 404, message: 'Not allowed' });
    expect(parsedOverride.status).toBe(404);
    expect(parsedOverride.message).toBe('Not allowed');
  });
});
