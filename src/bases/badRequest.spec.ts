import { z } from 'zod';
import { BadRequestResponse } from './badRequest';

describe('BadRequestResponse schema', () => {
  it('should be a valid Zod schema', () => {
    const schema = BadRequestResponse.content['application/json'].schema;

    expect(schema).toBeInstanceOf(z.ZodObject);
  });

  it('should have default status 400', () => {
    const schema = BadRequestResponse.content['application/json'].schema;
    const parsed = schema.parse({});

    expect(parsed.status).toBe(400);
  });

  it('should have default message "Bad Request"', () => {
    const schema = BadRequestResponse.content['application/json'].schema;
    const parsed = schema.parse({});

    expect(parsed.message).toBe('Bad Request');
  });

  it('should allow overriding default values', () => {
    const schema = BadRequestResponse.content['application/json'].schema;
    const parsed = schema.parse({ status: 422, message: 'Invalid input' });

    expect(parsed.status).toBe(422);
    expect(parsed.message).toBe('Invalid input');
  });
});
