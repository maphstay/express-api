import bcrypt from 'bcryptjs';
import { hashPassword, comparePasswords } from './passwordHash';

jest.mock('bcryptjs');

describe('Password Hashing Helper', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('hashPassword should return hashed string', () => {
    (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword123');

    const result = hashPassword('myPassword');

    expect(bcrypt.hashSync).toHaveBeenCalledWith('myPassword', 10);
    expect(result).toBe('hashedPassword123');
  });

  it('comparePasswords should return true when passwords match', () => {
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

    const result = comparePasswords('myPassword', 'hashedPassword123');

    expect(bcrypt.compareSync).toHaveBeenCalledWith('myPassword', 'hashedPassword123');
    expect(result).toBe(true);
  });

  it('comparePasswords should return false when passwords do not match', () => {
    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    const result = comparePasswords('wrongPassword', 'hashedPassword123');

    expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongPassword', 'hashedPassword123');
    expect(result).toBe(false);
  });
});
