
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Notifications } from './entities/notifications.entity';
import { UsersModule } from './../users/users.module'
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailerModule } from '../mailer/mailer.module';
import { CommonModule } from '../common/common.module'



@Module({
  imports: [TypeOrmModule.forFeature([Notifications]), UsersModule, MailerModule, CommonModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule { }
