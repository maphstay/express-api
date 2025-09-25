import { z } from 'zod';
import { NotFoundResponse } from './notFound';

describe('NotFoundResponse schema', () => {
  it('should return a valid Zod schema with the provided message', () => {
    const message = 'Resource not found';
    const response = NotFoundResponse(message);
    const schema = response.content['application/json'].schema;

    expect(response.description).toBe('Not Found');
    expect(schema).toBeInstanceOf(z.ZodObject);

    const parsed = schema.parse({});
    expect(parsed.status).toBe(404);
    expect(parsed.message).toBe(message);

    const parsedOverride = schema.parse({ status: 400, message: 'Different message' });
    expect(parsedOverride.status).toBe(400);
    expect(parsedOverride.message).toBe('Different message');
  });
});
