import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Contacts } from './entities/contacts.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { EventsModule } from 'src/events/events.module';
import { Events } from 'src/events/entities/event.entity';
import { EventInvitessContacts } from 'src/events/entities/events_invites_contacts.entity';
import { EventsChats } from 'src/events/entities/events_chats.entity';
import { SocketModule } from 'src/socket/socket.module';
import { Notifications } from 'src/notifications/entities/notifications.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contacts,
      Events,
      EventInvitessContacts,
      EventsChats,
      Notifications,
    ]),
    forwardRef(() => EventsModule),
    forwardRef(() => EventInvitessContacts),
    forwardRef(() => EventsChats),
    forwardRef(() => SocketModule),
    forwardRef(() => NotificationsModule),
  ],
  providers: [WhatsappService],
  exports: [WhatsappService],
  controllers: [WhatsappController],
})
export class WhatsappModule {}
