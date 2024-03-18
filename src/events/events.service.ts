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
import { EventsChats } from './entities/events_chats.entity';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Events)
        private readonly eventsRepository: Repository<Events>,
        @InjectRepository(EventInvitessContacts)
        private readonly eventInvitessContacts: Repository<EventInvitessContacts>,
        @InjectRepository(EventsChats)
        private readonly eventsChats: Repository<EventsChats>,
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
            eventDetail.invites = getUsers;
            eventDetail.status = 'active';
        }
        await this.eventsRepository.save(eventDetail);
        const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
        const invitesList = await queryBuilder.where("event_invitess_contacts.eventId = :id", { id: eventDetail.id })
            .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
            .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']).getMany();

        invitesList?.map(async (invite) => {
            invite.code = uuidV4();
            invite.usersId = userId;
            invite.haveChat = false;
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
            const { invites, events }: any = invite;
            const { image, name: eventName, id }: any = events
            const { callingCode, phoneNumber, name: recipientName, } = invites;
            const { status } = await this.whatsappService.sendInviteToGuest({
                callingCode,
                phoneNumber,
                text: `Hey ${recipientName}, \nWe are please to invite you to.\n${eventName}`,
                image,
                recipientName,
                eventName,
                eventId: id,
                contactId: invites?.id
            });
            if (status == 'success') {
                invite.status = 'invited';
                invite.sendList = true;
            }

            if (status == 'failed') {
                invite.status = 'failed';
                invite.sendList = true;
            }

            await this.eventInvitessContacts.save(invite);
        })


        return eventDetail;
    }


    public async findEventById(
        id: string,
    ): Promise<any> {
        const parsedValue = parseInt(id, 10);

        if (isNaN(parsedValue) && !isInt(parsedValue)) {
            throw new BadRequestException('Invalid event id: ' + parsedValue);

        }

        const eventItem: any = await this
            .eventsRepository
            .createQueryBuilder("events")
            .where("events.id = :id", { id: parsedValue })
            .leftJoinAndSelect('events.user', 'user')
            .leftJoinAndSelect('events.invites', 'invites')
            .select([
                'events',
                'invites.email',
                'invites.id',
                'invites.name',
                'invites.callingCode',
                'invites.phoneNumber',
                'user.id',
                'user.firstName',
                'user.lastName',
            ])
            .getOne();
        const stats = await this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts").where("event_invitess_contacts.eventId = :id", { id: id })
            .select("SUM(event_invitess_contacts.status='pending')", "GuestNotInvited")
            .addSelect("SUM(event_invitess_contacts.status='invited')", "GuestInvited")
            .addSelect("SUM(event_invitess_contacts.status='confirmed')", "GuestConfirmed")
            .addSelect("SUM(event_invitess_contacts.status='rejected')", "GuestRejected")
            .addSelect("SUM(event_invitess_contacts.haveChat='1')", "GuestMessages")
            .addSelect("SUM(event_invitess_contacts.numberOfScans)", "GuestScanned")
            .addSelect("SUM(event_invitess_contacts.status='failed')", "GuestFailed")
            .groupBy("event_invitess_contacts.eventId")
            .getRawMany();
        eventItem["stats"] = await Promise.all(stats);
        return eventItem;
    }



    public async findOneById(
        id: number,
    ): Promise<Events> {
        const eventId = await this.eventsRepository.findOneBy({ id });
        console.log("🚀 ~ CardService ~ cardItem:", eventId)
        this.commonService.checkEntityExistence(eventId, 'event');
        return eventId;
    }

    public async findInviteOneById(
        id: number,
        eventId: number
    ): Promise<EventInvitessContacts> {
        const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
        const invite = await queryBuilder.where("event_invitess_contacts.eventId = :id", { id: eventId })
            .andWhere("event_invitess_contacts.contactsId = :id", { id: id })
            .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
            .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']).getOne();
        return invite;
    }

    public async getEventsByUserId(
        id: string,
        pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<EventDto>> {
        const queryBuilder = this.eventsRepository.createQueryBuilder("events");
        queryBuilder.where("events.userId = :id", { id: id })
            .leftJoinAndSelect('events.user', 'user')
            .select(['events', 'user.id', 'user.firstName', 'user.lastName',])
            .orderBy("events.createdAt", pageOptionsDto.order)

        if (pageOptionsDto.status !== '') {
            queryBuilder.andWhere("events.status like :status", { status: `%${pageOptionsDto.status}%` });
        }
        if (pageOptionsDto.status == '') {
            queryBuilder.andWhere("events.status IN(:...keys)", { keys: ['active', 'draft'] });
        }

        const itemCount = await queryBuilder.getCount();
        let { entities }: any = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(await Promise.all(entities), pageMetaDto);
    }

    public async getGuestsByEventId(
        eventId: string,
        pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<EventDto>> {
        if (isNull(eventId) || isUndefined(eventId)) {
            throw new BadRequestException(['Event id cannot be null']);
        }
        const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
        await queryBuilder.where("event_invitess_contacts.eventId = :id", { id: eventId })
            .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
            .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email'])
        if (pageOptionsDto.status !== '') {
            queryBuilder.andWhere("event_invitess_contacts.status like :status", { status: `%${pageOptionsDto.status}%` });
        }

        const itemCount = await queryBuilder.getCount();
        let { entities }: any = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(await Promise.all(entities), pageMetaDto);
    }

    async deleteRecordByEventAndContact(eventId: number, contactsId: number): Promise<IMessage> {
        const event: any = eventId;
        if (isNaN(event) && !isInt(event)) {
            throw new BadRequestException('Invalid event id: ' + event);
        }
        const contact: any = contactsId;
        if (isNaN(contact) && !isInt(contact)) {
            throw new BadRequestException('Invalid contact id: ' + contact);

        }
        //@ts-ignore
        await this.eventInvitessContacts.delete({ eventId: event, invites: contact });
        return this.commonService.generateMessage('Guest deleted successfully!');
    }


    public async getAllChatMessagesOfEvent(
        eventId: string,
        userId: string,
        contactId: string,
        pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<EventDto>> {
        const queryBuilder = this.eventsChats.createQueryBuilder("events_chats");
        queryBuilder.where("events_chats.actionUserId = :actionUserId", { actionUserId: userId })
            .andWhere("events_chats.eventId = :eventId", { eventId: eventId })
            .andWhere("events_chats.contactId = :contactId", { contactId: contactId })
            .leftJoinAndSelect('events_chats.contact', 'contact')
            .select(['events_chats', 'contact.id', 'contact.name', 'contact.callingCode', 'contact.phoneNumber'])
            .orderBy("events_chats.createdAt", pageOptionsDto.order)

        const itemCount = await queryBuilder.getCount();
        let { entities }: any = await queryBuilder.getRawAndEntities();
        console.log("🚀 ~ EventsService ~ entities:", entities)

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(await Promise.all(entities), pageMetaDto);
    }

    public async getAllChatsOfEvent(
        eventId: string,
        userId: string,
        pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<EventDto>> {

        const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
        queryBuilder.where("event_invitess_contacts.eventId = :id", { id: eventId })
            .andWhere("event_invitess_contacts.usersId = :userId", { userId: userId })
            .andWhere("event_invitess_contacts.haveChat = :haveChat", { haveChat: true })
            .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
            .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']);

        const itemCount = await queryBuilder.getCount();
        let { entities }: any = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(await Promise.all(entities), pageMetaDto);
    }

    public async getAllChatsOfUser(
        userId: string,
        pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<EventDto>> {

        const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
        queryBuilder.where("event_invitess_contacts.usersId = :userId", { userId: userId })
            .andWhere("event_invitess_contacts.haveChat = :haveChat", { haveChat: true })
            .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
            .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']);

        const itemCount = await queryBuilder.getCount();
        let { entities }: any = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(await Promise.all(entities), pageMetaDto);
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

    public async delete(id: string): Promise<IMessage> {
        const parsedValue = parseInt(id, 10);

        if (isNaN(parsedValue) && !isInt(parsedValue)) {
            throw new BadRequestException('Invalid event id: ' + parsedValue);

        }

        await this.eventsRepository.softDelete(parsedValue);
        return this.commonService.generateMessage('Event deleted successfully!');
    }

    public async findOne(options): Promise<Events> {
        return await this.eventsRepository.findOne(options);
    }

    public async update(eventId: string, dto: UpdateEventDto, actionUser = null): Promise<Events> {
        const { user: userId, contacts, name, image, eventDate, status, showQRCode, nearby, address, notes, latitude, longitude } = dto;
        let contacts_ids = [];
        if (contacts?.length) {
            contacts_ids = await this.contactsService.getOrCreateContacts(contacts, userId);
        }

        const parsedValue = parseInt(eventId, 10);
        const eventItem = await this.findOne({
            where: { id: parsedValue },
            relations: ['user', 'invites']
        });
        // below line assumed user entity/object will be returned and prev findOneById method was not returning any user,
        // causing wrong decision and we had issues, fixed it with new method findOne
        const eventCreator: any = eventItem?.user;
        // deleting to avoid returning user detail in response
        delete eventItem.user;

        try {
            if (!isUndefined(userId) && !isNull(userId)) {
                eventItem.user = userId;
            }

            if (!isUndefined(name) && !isNull(name)) {
                eventItem.name = name;
            }


            if (!isUndefined(image) && !isNull(image)) {
                eventItem.image = image;
            }

            if (!isUndefined(notes) && !isNull(notes)) {
                eventItem.notes = notes;
            }

            if (!isUndefined(status) && !isNull(status)) {
                eventItem.status = status;
            }

            if (!isUndefined(eventDate) && !isNull(eventDate)) {
                eventItem.eventDate = eventDate;
            }

            if (!isUndefined(showQRCode) && !isNull(showQRCode)) {
                eventItem.showQRCode = showQRCode;
            }

            if (!isUndefined(nearby) && !isNull(nearby)) {
                eventItem.nearby = nearby;
            }

            if (!isUndefined(address) && !isNull(address)) {
                eventItem.address = address;
            }

            if (!isUndefined(latitude) && !isNull(latitude)) {
                eventItem.latitude = latitude;
            }
            if (!isUndefined(longitude) && !isNull(longitude)) {
                eventItem.longitude = longitude;
            }

            if (!isUndefined(contacts_ids) && !isNull(contacts_ids) && contacts_ids?.length) {
                const newCandidates: any = contacts_ids.map(item => {
                    console.log("🚀 ~ EventsService ~ update ~ item:", item)
                    return {
                        eventId: eventId,
                        invites:{ id: Number(item) },
                        code: uuidV4(),
                        usersId: userId,
                        haveChat: false,
                    }
                })
                const insertCandidates = this.eventInvitessContacts.create(newCandidates);
                await this.eventInvitessContacts.save(insertCandidates);

            }
            const userDetail = await this.usersService.findOne({
                where: { id: eventCreator?.id },
                // relations: ['company'] no relation from user to company as of now in case we need company
            });

            eventItem.updatedAt = new Date();
            await this.eventsRepository.save(eventItem);
            const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
            const invitesList = await queryBuilder.where("event_invitess_contacts.eventId = :id", { id: eventItem.id })
                .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
                .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']).getMany();

            invitesList?.map(async (invite) => {
                invite.code = uuidV4();
                invite.usersId = userId;
                invite.haveChat = false;
                await this.eventInvitessContacts.save(invite);
            })


            return eventItem;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                const errorMessage = error.message;
                console.log("🚀 ~ file: event.service.ts:580 ~ EventService ~ update ~ errorMessage:", errorMessage)
                const match = /Duplicate entry '(.+)' for key '(.+)'/i.exec(errorMessage);

                if (match) {
                    const duplicateValue = match[1];
                    console.log("🚀 ~ EventsService ~ update ~ duplicateValue:", duplicateValue)
                    const duplicateKey = match[2];
                    const [event_id, contact_id] = duplicateValue.split("-")
                    console.log("🚀 ~ EventsService ~ update ~ event_id, contact_id:", event_id, contact_id)

                    const existingRecord: any = await this.contactsService.findOneByWhere({ id: In([contact_id]) })
                    // console.log("🚀 ~ file: assessment.service.ts:596 ~ AssessmentService ~ update ~ existingRecord:", existingRecord)
                    throw new BadRequestException([{
                        callingCode:existingRecord[0]?.callingCode,
                        phoneNumber:existingRecord[0]?.phoneNumber
                    }]);
                }
            } else {
                // Handle other errors.
                throw new BadRequestException([error?.message]);

            }
        }


    }



}
