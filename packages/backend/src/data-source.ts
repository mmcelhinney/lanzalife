import { DataSource } from 'typeorm';
import { Place } from './entity/Place';
import { Activity } from './entity/Activity';
import { Event } from './entity/Event';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [Place, Activity, Event],
  migrations: [],
  subscribers: [],
});
