import { InjectRepository } from '@nestjs/typeorm';
import { Code, In, Like, Repository } from 'typeorm';
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
    forwardRef,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Events } from './entities/event.entity';
import { EventInvitessContacts } from './entities/events_invites_contacts.entity';

import { isInt } from 'class-validator';
import { EventDto } from './dtos/create-event.dto';
import { PageDto } from "./dtos/page.dto";
import { PageMetaDto } from "./dtos/page-meta.dto";
import { PageOptionsDto } from "./dtos/page-option.dto";
import { UsersService } from '../users/users.service';
import { IMessage } from 'src/common/interfaces/message.interface';
import { UpdateEventDto } from './dtos/update-event.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { v4 as uuidV4, v5 as uuidV5 } from 'uuid';
import { JwtService } from 'src/jwt/jwt.service';
import { TokenTypeEnum } from 'src/jwt/enums/token-type.enum';
import { IEmailToken } from 'src/jwt/interfaces/email-token.interface';
import { Users } from 'src/users/entities/user.entity';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Events)
        private readonly eventsRepository: Repository<Events>,
        @InjectRepository(EventInvitessContacts)
        private readonly eventInvitessContacts: Repository<EventInvitessContacts>,
       
    ) { }





}
