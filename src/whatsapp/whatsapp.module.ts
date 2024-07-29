import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Contacts } from './entities/contacts.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { UsersModule } from 'src/users/users.module';
import { EventsModule } from 'src/events/events.module';
import { Events } from 'src/events/entities/event.entity';
import { EventInvitessContacts } from 'src/events/entities/events_invites_contacts.entity';
import { EventsChats } from 'src/events/entities/events_chats.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contacts,
      Events,
      EventInvitessContacts,
      EventsChats,
    ]),
    // UsersModule,
    forwardRef(() => UsersModule),
    forwardRef(() => EventsModule),
    forwardRef(() => EventInvitessContacts),
    forwardRef(() => EventsChats),
    forwardRef(() => SocketModule),
  ],
  providers: [WhatsappService],
  exports: [WhatsappService],
  controllers: [WhatsappController],
})
export class WhatsappModule {}
