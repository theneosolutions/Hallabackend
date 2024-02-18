import * as dotenv from 'dotenv';
import { cwd, env } from 'process';
import { DataSource } from 'typeorm';

dotenv.config();

export const dataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT) || 3306,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [cwd() + '/src/**/*.entity.ts'],
  migrations: [cwd() + '/src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  dropSchema: false,
});