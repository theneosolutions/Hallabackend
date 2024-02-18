
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IEmailConfig } from './email-config.interface';
import { IJwt } from './jwt.interface';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  db: TypeOrmModuleOptions;
  jwt: IJwt;
  emailService: IEmailConfig;
  testing: boolean;
}
