 

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Contacts } from './entities/contacts.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contacts]),UsersModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
  controllers: [WhatsappController],
})
export class WhatsappModule {}
