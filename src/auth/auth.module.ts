

import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([BlacklistedToken]), UsersModule, JwtModule, MailerModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
