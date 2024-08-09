import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Card } from './entities/card.entity';
import { Events } from './../events/entities/event.entity';
import { UsersModule } from '../users/users.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { MailerModule } from '../mailer/mailer.module';
import { UploaderModule } from '../uploader/uploader.module';
import { Users } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, Events, Users]),
    forwardRef(() => UsersModule),

    MailerModule,
    UploaderModule,
  ],
  providers: [CardService],
  exports: [CardService],
  controllers: [CardController],
})
export class CardModule {}
