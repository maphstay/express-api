import { TopicVersion } from '@modules/topic/topic.entity';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data-db.json');

export type DBData = {
  users: any[];
  resources: any[];
  topicVersions: TopicVersion[];
};

const defaultData: DBData = { users: [], resources: [], topicVersions: [] };

export const readDB = (): DBData => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('readDB error', err);
    return defaultData;
  }
};

export const writeDB = (data: DBData): void => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};
