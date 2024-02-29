
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Events } from './entities/event.entity';
import { EventInvitessContacts } from './entities/events_invites_contacts.entity';
import { UsersModule } from './../users/users.module'
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Users } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Events, EventInvitessContacts, Users]), UsersModule,],
  providers: [EventsService],
  exports: [EventsService],
  controllers: [EventsController],
})
export class AssessmentModule { }
