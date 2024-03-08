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
import { RatioEnum } from 'src/uploader/enums';
import { UploaderService } from 'src/uploader/uploader.service';
import { CardService } from 'src/cards/card.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { EventGuestsDto } from './dtos/create-guests-event.dto';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Events)
        private readonly eventsRepository: Repository<Events>,
        @InjectRepository(EventInvitessContacts)
        private readonly eventInvitessContacts: Repository<EventInvitessContacts>,
        private readonly usersService: UsersService,
        private readonly cardService: CardService,
        private readonly uploaderService: UploaderService,
        private readonly contactsService: ContactsService,
        private readonly whatsappService: WhatsappService,
        private readonly commonService: CommonService,

    ) { }


    public async create(origin: string | undefined, dto: EventDto): Promise<Events> {
        console.log("🚀 ~ EventsService ~ create ~ dto:", dto)
        const { user: userId, name, cardId, image, eventDate, showQRCode, address, nearby, latitude, longitude, notes } = dto;

        if (isNaN(userId) || isNull(userId) || isUndefined(userId)) {
            throw new BadRequestException(['User cannot be null']);
        }

        const userDetail = await this.usersService.findOneById(userId);

        if (isNull(userDetail) || isUndefined(userDetail)) {
            throw new BadRequestException(['User not found with id: ' + userId]);
        }

        if (isNull(cardId) || isUndefined(cardId)) {
            throw new BadRequestException(['cardId cannot be null']);
        }

        const cardDetail = await this.cardService.findOneById(cardId);
        console.log("🚀 ~ EventsService ~ create ~ cardDetail:", cardDetail)


        if (isNull(cardDetail) || isUndefined(cardDetail)) {
            throw new BadRequestException(['Card not found with id: ' + cardId]);
        }

        if (isNull(image) || isUndefined(image)) {
            throw new BadRequestException(['image cannot be null']);
        }

        if (isNull(name) || isUndefined(name)) {
            throw new BadRequestException(['name cannot be null']);
        }

        if (isNull(eventDate) || isUndefined(eventDate)) {
            throw new BadRequestException(['eventDate cannot be null']);
        }

        if (isNull(address) || isUndefined(address)) {
            throw new BadRequestException(['address cannot be null']);
        }

        if (isNull(latitude) || isUndefined(latitude)) {
            throw new BadRequestException(['latitude cannot be null']);
        }

        if (isNull(longitude) || isUndefined(longitude)) {
            throw new BadRequestException(['longitude cannot be null']);
        }


        const event = this.eventsRepository.create({
            //@ts-ignore
            user: userDetail?.id,
            card: cardId,
            name: name,
            image: image,
            eventDate: eventDate,
            showQRCode: showQRCode || false,
            status: 'draft',
            notes: notes || '',
            nearby: nearby || null,
            address: address || "",
            latitude: latitude,
            longitude: longitude
        });
        await this.eventsRepository.insert(event);
        return event;
    }

    public async addContactsIntoEvent(origin: string | undefined, dto: EventGuestsDto, id: string): Promise<Events> {
        console.log("🚀 ~ EventsService ~ create ~ dto:", dto)
        const { user: userId, contacts } = dto;
        let contacts_ids = [];

        if (isNaN(userId) || isNull(userId) || isUndefined(userId)) {
            throw new BadRequestException(['User cannot be null']);
        }

        const userDetail = await this.usersService.findOneById(userId);

        if (isNull(userDetail) || isUndefined(userDetail)) {
            throw new BadRequestException(['User not found with id: ' + userId]);
        }

        if (isNull(id) || isUndefined(id)) {
            throw new BadRequestException(['Event id cannot be null']);
        }

        const eventDetail = await this.findOneById(Number(id));


        if (isNull(eventDetail) || isUndefined(eventDetail)) {
            throw new BadRequestException(['Event not found with id: ' + id]);
        }

        if (contacts?.length) {
            console.log("🚀 ~ EventsService ~ addContactsIntoEvent ~ contacts:", contacts)
            contacts_ids = await this.contactsService.getOrCreateContacts(contacts, userId);
            console.log("🚀 ~ EventsService ~ addContactsIntoEvent ~ contacts_ids:", contacts_ids)
        }

        if (contacts_ids?.length) {
            const getUsers = await this.contactsService.findOneByWhere({ id: In(contacts_ids) })
            console.log("🚀 ~ EventsService ~ addContactsIntoEvent ~ getUsers:", getUsers)
            if (!getUsers || getUsers.length < 1) throw new BadRequestException({ error: "No Contacts found with given IDs" })
            eventDetail.invites = getUsers
        }
        await this.eventsRepository.save(eventDetail);
        const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
        const invitesList = await queryBuilder.where("event_invitess_contacts.eventId = :id", { id: eventDetail.id })
            .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
            .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']).getMany();

        invitesList?.map(async (invite) => {
            invite.code = uuidV4();
            invite.usersId = userId
            await this.eventInvitessContacts.save(invite);
        })


        return eventDetail;
    }

    public async sendEventInvites(userId: number, id: string): Promise<Events> {

        if (isNaN(userId) || isNull(userId) || isUndefined(userId)) {
            throw new BadRequestException(['User cannot be null']);
        }

        const userDetail = await this.usersService.findOneById(userId);

        if (isNull(userDetail) || isUndefined(userDetail)) {
            throw new BadRequestException(['User not found with id: ' + userId]);
        }

        if (isNull(id) || isUndefined(id)) {
            throw new BadRequestException(['Event id cannot be null']);
        }

        const eventDetail = await this.findOneById(Number(id));


        if (isNull(eventDetail) || isUndefined(eventDetail)) {
            throw new BadRequestException(['Event not found with id: ' + id]);
        }

        const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
        const invitesList = await queryBuilder.where("event_invitess_contacts.eventId = :id", { id: eventDetail.id })
            .andWhere("event_invitess_contacts.status = :status", { status: 'pending' })
            .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
            .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']).getMany();
        invitesList?.map(async (invite) => {
            console.log("🚀 ~ EventsService ~ invitesList?.map ~ invite:", invite)
            const {invites,events}:any = invite;
            const {image,name:eventName}:any = events
            const {callingCode,phoneNumber,name:recipientName} = invites;
            await this.whatsappService.sendInviteToGuest({
                callingCode,
                phoneNumber,
                text: `Hey ${recipientName}, \nWe are please to invite you to.\n${eventName}`,
                image,
                recipientName,
                eventName
            })

            await this.eventInvitessContacts.save(invite);
        })


        return eventDetail;
    }



    public async findOneById(
        id: number,
    ): Promise<Events> {
        const eventId = await this.eventsRepository.findOneBy({ id });
        console.log("🚀 ~ CardService ~ cardItem:", eventId)
        this.commonService.checkEntityExistence(eventId, 'event');
        return eventId;
    }


    public async uploadImage(
        file: Express.Multer.File,
        ratio?: RatioEnum,
        fileType?: string,
    ): Promise<string> {

        try {
            const uploadedFile = await this.uploaderService.uploadImage(1, file, ratio, fileType);
            if (!isUndefined(uploadedFile) && !isNull(uploadedFile)) {
                return uploadedFile;
            }

        } catch (error) {
            console.log("🚀 ~ file: users.service.ts:235 ~ UsersService ~ error", error)
            throw new InternalServerErrorException(['Error uploading image']);
        }
    }



}
