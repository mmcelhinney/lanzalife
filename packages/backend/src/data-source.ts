import { DataSource } from 'typeorm';
import { Place } from './entity/Place';
import { Activity } from './entity/Activity';
import { Event } from './entity/Event';
import { User } from './entity/User';
import { Role } from './entity/Role';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'MynewPass123',
  database: 'lanzalife',
  synchronize: true,
  logging: false,
  entities: [Place, Activity, Event, User, Role],
  migrations: [],
  subscribers: [],
});