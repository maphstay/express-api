import fs from 'fs';
import path from 'path';
import { DBData, readDB, writeDB } from './jsonDb';
import { RoleEnum } from '@modules/user/user.entity';

jest.mock('fs');

describe('data-db', () => {
  const DB_PATH = path.join(__dirname, '../../data-db.json');
  const defaultData: DBData = { users: [], resources: [], topicVersions: [] };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readDB', () => {
    it('should create file with default data if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const writeFileSyncMock = fs.writeFileSync as jest.Mock;

      const data = readDB();

      expect(fs.existsSync).toHaveBeenCalledWith(DB_PATH);
      expect(writeFileSyncMock).toHaveBeenCalledWith(DB_PATH, JSON.stringify(defaultData, null, 2));
      expect(data).toEqual(defaultData);
    });

    it('should read and parse existing file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({ users: [{ id: 'u1' }], resources: [], topicVersions: [] }),
      );

      const data = readDB();

      expect(fs.readFileSync).toHaveBeenCalledWith(DB_PATH, 'utf-8');
      expect(data).toEqual({ users: [{ id: 'u1' }], resources: [], topicVersions: [] });
    });

    it('should return default data if readFileSync throws error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('fail');
      });

      const data = readDB();

      expect(data).toEqual(defaultData);
    });
  });

  describe('writeDB', () => {
    it('should write provided data to file', () => {
      const writeFileSyncMock = fs.writeFileSync as jest.Mock;
      const sampleData: DBData = {
        users: [
          {
            id: 'u1',
            name: 'test',
            email: 'test',
            role: RoleEnum.ADMIN,
            password: 'test',
            createdAt: '',
          },
        ],
        resources: [],
        topicVersions: [],
      };

      writeDB(sampleData);

      expect(writeFileSyncMock).toHaveBeenCalledWith(DB_PATH, JSON.stringify(sampleData, null, 2));
    });
  });
});
