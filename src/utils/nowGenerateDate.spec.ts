import { now } from './nowGenerateDate';

describe('now helper', () => {
  it('should return current date in ISO string format', () => {
    const mockDate = new Date('2025-09-25T12:34:56.000Z');
    const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const result = now();

    expect(result).toBe('2025-09-25T12:34:56.000Z');

    dateSpy.mockRestore();
  });
});
