import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Events } from './entities/event.entity';
import { EventInvitessContacts } from './entities/events_invites_contacts.entity';
import { UsersModule } from './../users/users.module';
import { UploaderModule } from './../uploader/uploader.module';
import { CardModule } from './../cards/card.module';
import { ContactsModule } from './../contacts/contacts.module';
import { WhatsappModule } from './../whatsapp/whatsapp.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Users } from 'src/users/entities/user.entity';
import { EventsChats } from './entities/events_chats.entity';
import { Contacts } from 'src/contacts/entities/contacts.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Events,
      EventInvitessContacts,
      Users,
      EventsChats,
      Contacts,
    ]),
    // UsersModule,
    forwardRef(() => UsersModule),
    UploaderModule,
    CardModule,
    ContactsModule,
    forwardRef(() => SocketModule),
    forwardRef(() => WhatsappModule),
  ],
  providers: [EventsService],
  exports: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
