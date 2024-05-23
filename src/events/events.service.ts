import { InjectRepository } from '@nestjs/typeorm';
import { Code, Connection, In, Like, Repository } from 'typeorm';
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
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { PageOptionsDto } from './dtos/page-option.dto';
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
import { all } from 'axios';
import { Contacts } from '../contacts/entities/contacts.entity';
import { ContactsPageOptionsDto } from './dtos/contacts-page-option.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    @InjectRepository(EventInvitessContacts)
    private readonly eventInvitessContacts: Repository<EventInvitessContacts>,
    @InjectRepository(Contacts)
    private readonly contacts: Repository<Contacts>,

    @InjectRepository(EventsChats)
    private readonly eventsChats: Repository<EventsChats>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    // private readonly usersService: UsersService,
    private readonly cardService: CardService,
    private readonly uploaderService: UploaderService,
    private readonly contactsService: ContactsService,
    private readonly whatsappService: WhatsappService,
    private readonly commonService: CommonService,
    private readonly connection: Connection,
  ) {}

  public async create(
    origin: string | undefined,
    dto: EventDto,
  ): Promise<Events> {
    console.log('🚀 ~ EventsService ~ create ~ dto:', dto);
    const {
      user: userId,
      name,
      cardId,
      image,
      eventDate,
      showQRCode,
      address,
      nearby,
      latitude,
      longitude,
      notes,
    } = dto;

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
    console.log('🚀 ~ EventsService ~ create ~ cardDetail:', cardDetail);

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
      address: address || '',
      latitude: latitude,
      longitude: longitude,
    });
    await this.eventsRepository.insert(event);
    return event;
  }

  public async addContactsIntoEvent(
    origin: string | undefined,
    dto: EventGuestsDto,
    id: string,
  ): Promise<Events> {
    console.log('🚀 ~ EventsService ~ create ~ dto:', dto);
    const { user: userId, contacts } = dto;
    let contacts_ids = [];
    try {
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
        console.log(
          '🚀 ~ EventsService ~ addContactsIntoEvent ~ contacts:',
          contacts,
        );
        contacts_ids = await this.contactsService.getOrCreateContacts(
          contacts,
          userId,
        );
        console.log(
          '🚀 ~ EventsService ~ addContactsIntoEvent ~ contacts_ids:',
          contacts_ids,
        );
      }

      if (contacts_ids?.length) {
        const newCandidates: any = contacts_ids.map((item) => {
          return {
            eventId: eventDetail?.id,
            contactsId: Number(item?.id),
            usersId: userId,
            haveChat: false,
            numberOfGuests: item?.guestcount ? item?.guestcount + 1 : 1,
          };
        });

        const values = newCandidates
          .map(
            (candidate) =>
              `(${candidate.contactsId}, ${candidate.eventId}, ${candidate.usersId},${candidate.haveChat},${candidate.numberOfGuests})`,
          )
          .join(', ');
        // Construct the full INSERT query
        console.log(
          '🚀 ~ EventsService ~ addContactsIntoEvent ~ values:',
          values,
        );
        const query = `INSERT INTO event_invitess_contacts (contactsId, eventId, usersId,haveChat,numberOfGuests) VALUES ${values};`;
        const results = await this.connection.query(query);
        console.log(
          '🚀 ~ EventsService ~ addContactsIntoEvent ~ query:',
          query,
        );
        console.log('🚀 ~ EventsService ~ update ~ results:', results);
        eventDetail.status = 'active';
      }
      await this.eventsRepository.save(eventDetail);

      return eventDetail;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const errorMessage = error.message;
        console.log(
          '🚀 ~ file: event.service.ts:580 ~ EventService ~ update ~ errorMessage:',
          errorMessage,
        );
        const match = /Duplicate entry '(.+)' for key '(.+)'/i.exec(
          errorMessage,
        );

        if (match) {
          const duplicateValue = match[1];
          console.log(
            '🚀 ~ EventsService ~ update ~ duplicateValue:',
            duplicateValue,
          );
          const duplicateKey = match[2];
          const [event_id, contact_id] = duplicateValue.split('-');
          console.log(
            '🚀 ~ EventsService ~ update ~ event_id, contact_id:',
            event_id,
            contact_id,
          );

          const existingRecord: any = await this.contactsService.findOneByWhere(
            { id: In([contact_id]) },
          );
          // console.log("🚀 ~ file: assessment.service.ts:596 ~ AssessmentService ~ update ~ existingRecord:", existingRecord)
          throw new BadRequestException([
            {
              callingCode: existingRecord[0]?.callingCode,
              phoneNumber: existingRecord[0]?.phoneNumber,
            },
          ]);
        }
      } else {
        // Handle other errors.
        throw new BadRequestException([error?.message]);
      }
    }
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

    const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
      'event_invitess_contacts',
    );
    const rawQuery = `
            SELECT 
                event_invitess_contacts.status AS event_invitess_contacts_status, 
                event_invitess_contacts.numberOfScans AS event_invitess_contacts_numberOfScans, 
                event_invitess_contacts.numberOfGuests AS event_invitess_contacts_numberOfGuests, 
                event_invitess_contacts.usersId AS event_invitess_contacts_usersId, 
                event_invitess_contacts.eventId AS event_invitess_contacts_eventId, 
                event_invitess_contacts.code AS event_invitess_contacts_code, 
                event_invitess_contacts.notes AS event_invitess_contacts_notes, 
                event_invitess_contacts.haveChat AS event_invitess_contacts_haveChat, 
                event_invitess_contacts.selectedEvent AS event_invitess_contacts_selectedEvent, 
                event_invitess_contacts.sendList AS event_invitess_contacts_sendList, 
                event_invitess_contacts.createdAt AS event_invitess_contacts_createdAt, 
                event_invitess_contacts.updatedAt AS event_invitess_contacts_updatedAt, 
                event_invitess_contacts.deletedAt AS event_invitess_contacts_deletedAt, 
                event_invitess_contacts.contactsId AS event_invitess_contacts_contactsId, 
                invites.id AS invites_id, 
                invites.name AS invites_name, 
                invites.email AS invites_email, 
                invites.callingCode AS invites_callingCode, 
                invites.phoneNumber AS invites_phoneNumber, 
                events.id AS events_id, 
                events.name AS events_name, 
                events.image AS events_image, 
                events.status AS events_status, 
                events.notes AS events_notes, 
                events.eventDate AS events_eventDate, 
                events.showQRCode AS events_showQRCode, 
                events.nearby AS events_nearby, 
                events.address AS events_address, 
                events.latitude AS events_latitude, 
                events.longitude AS events_longitude, 
                events.code AS events_code, 
                events.createdAt AS events_createdAt, 
                events.updatedAt AS events_updatedAt, 
                events.deletedAt AS events_deletedAt, 
                events.userId AS events_userId 
            FROM 
                event_invitess_contacts 
            LEFT JOIN 
                contacts invites ON invites.id = event_invitess_contacts.contactsId AND invites.deletedAt IS NULL
            LEFT JOIN 
                events ON events.id = event_invitess_contacts.eventId AND events.deletedAt IS NULL 
            WHERE 
                event_invitess_contacts.eventId = ? AND event_invitess_contacts.status = ? 
                AND event_invitess_contacts.deletedAt IS NULL`;
    const entities = await this.connection.query(rawQuery, [
      eventDetail.id,
      'pending',
    ]);
    const invitesList = entities.map((entity) => ({
      status: entity.event_invitess_contacts_status,
      numberOfScans: entity.event_invitess_contacts_numberOfScans,
      numberOfGuests: entity.event_invitess_contacts_numberOfGuests,
      usersId: entity.event_invitess_contacts_usersId,
      eventId: entity.event_invitess_contacts_eventId,
      code: entity.event_invitess_contacts_code,
      notes: entity.event_invitess_contacts_notes,
      haveChat: entity.event_invitess_contacts_haveChat,
      selectedEvent: entity.event_invitess_contacts_selectedEvent,
      sendList: entity.event_invitess_contacts_sendList,
      createdAt: entity.event_invitess_contacts_createdAt,
      updatedAt: entity.event_invitess_contacts_updatedAt,
      invites: {
        id: entity.invites_id,
        name: entity.invites_name,
        email: entity.invites_email,
        callingCode: entity.invites_callingCode,
        phoneNumber: entity.invites_phoneNumber,
      },
      events: {
        id: entity.events_id,
        name: entity.events_name,
        image: entity.events_image,
        status: entity.events_status,
        notes: entity.events_notes,
        eventDate: entity.events_eventDate,
        showQRCode: entity.events_showQRCode,
        address: entity.events_address,
        latitude: entity.events_latitude,
        longitude: entity.events_longitude,
        code: entity.events_code,
        createdAt: entity.events_createdAt,
        updatedAt: entity.events_updatedAt,
      },
    }));

    invitesList?.map(async (invite) => {
      console.log('🚀 ~ EventsService ~ invitesList?.map ~ invite:', invite);
      const { invites, events }: any = invite;
      const { image, name: eventName, id }: any = events;
      const { callingCode, phoneNumber, name: recipientName } = invites;
      const { status } = await this.whatsappService.sendInviteToGuest({
        callingCode,
        phoneNumber,
        text: `Hey ${recipientName}, \nWe are please to invite you to.\n${eventName}`,
        image,
        recipientName,
        eventName,
        eventId: id,
        contactId: invites?.id,
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
    });

    return eventDetail;
  }

  public async sendEventsReminder(userId: number, id: string): Promise<Events> {
    if (isNull(id) || isUndefined(id)) {
      throw new BadRequestException(['Event id cannot be null']);
    }

    const eventDetail = await this.findOneById(Number(id));

    if (isNull(eventDetail) || isUndefined(eventDetail)) {
      throw new BadRequestException(['Event not found with id: ' + id]);
    }

    const rawQuery = `
            SELECT 
                event_invitess_contacts.status AS event_invitess_contacts_status, 
                event_invitess_contacts.numberOfScans AS event_invitess_contacts_numberOfScans, 
                event_invitess_contacts.numberOfGuests AS event_invitess_contacts_numberOfGuests, 
                event_invitess_contacts.usersId AS event_invitess_contacts_usersId, 
                event_invitess_contacts.eventId AS event_invitess_contacts_eventId, 
                event_invitess_contacts.code AS event_invitess_contacts_code, 
                event_invitess_contacts.notes AS event_invitess_contacts_notes, 
                event_invitess_contacts.haveChat AS event_invitess_contacts_haveChat, 
                event_invitess_contacts.selectedEvent AS event_invitess_contacts_selectedEvent, 
                event_invitess_contacts.sendList AS event_invitess_contacts_sendList, 
                event_invitess_contacts.createdAt AS event_invitess_contacts_createdAt, 
                event_invitess_contacts.updatedAt AS event_invitess_contacts_updatedAt, 
                event_invitess_contacts.deletedAt AS event_invitess_contacts_deletedAt, 
                event_invitess_contacts.contactsId AS event_invitess_contacts_contactsId, 
                invites.id AS invites_id, 
                invites.name AS invites_name, 
                invites.email AS invites_email, 
                invites.callingCode AS invites_callingCode, 
                invites.phoneNumber AS invites_phoneNumber, 
                events.id AS events_id, 
                events.name AS events_name, 
                events.image AS events_image, 
                events.status AS events_status, 
                events.notes AS events_notes, 
                events.eventDate AS events_eventDate, 
                events.showQRCode AS events_showQRCode, 
                events.nearby AS events_nearby, 
                events.address AS events_address, 
                events.latitude AS events_latitude, 
                events.longitude AS events_longitude, 
                events.code AS events_code, 
                events.createdAt AS events_createdAt, 
                events.updatedAt AS events_updatedAt, 
                events.deletedAt AS events_deletedAt, 
                events.userId AS events_userId 
            FROM 
                event_invitess_contacts 
            LEFT JOIN 
                contacts invites ON invites.id = event_invitess_contacts.contactsId AND invites.deletedAt IS NULL
            LEFT JOIN 
                events ON events.id = event_invitess_contacts.eventId AND events.deletedAt IS NULL 
            WHERE 
                event_invitess_contacts.eventId = ? AND event_invitess_contacts.status IN ('invited', 'confirmed') 
                AND event_invitess_contacts.deletedAt IS NULL`;

    const entities = await this.connection.query(rawQuery, [eventDetail.id]);

    const invitesList = entities.map((entity) => ({
      status: entity.event_invitess_contacts_status,
      numberOfScans: entity.event_invitess_contacts_numberOfScans,
      numberOfGuests: entity.event_invitess_contacts_numberOfGuests,
      usersId: entity.event_invitess_contacts_usersId,
      eventId: entity.event_invitess_contacts_eventId,
      code: entity.event_invitess_contacts_code,
      notes: entity.event_invitess_contacts_notes,
      haveChat: entity.event_invitess_contacts_haveChat,
      selectedEvent: entity.event_invitess_contacts_selectedEvent,
      sendList: entity.event_invitess_contacts_sendList,
      createdAt: entity.event_invitess_contacts_createdAt,
      updatedAt: entity.event_invitess_contacts_updatedAt,
      invites: {
        id: entity.invites_id,
        name: entity.invites_name,
        email: entity.invites_email,
        callingCode: entity.invites_callingCode,
        phoneNumber: entity.invites_phoneNumber,
      },
      events: {
        id: entity.events_id,
        name: entity.events_name,
        image: entity.events_image,
        status: entity.events_status,
        notes: entity.events_notes,
        eventDate: entity.events_eventDate,
        showQRCode: entity.events_showQRCode,
        address: entity.events_address,
        latitude: entity.events_latitude,
        longitude: entity.events_longitude,
        code: entity.events_code,
        createdAt: entity.events_createdAt,
        updatedAt: entity.events_updatedAt,
      },
    }));

    invitesList?.map(async (invite) => {
      console.log('🚀 ~ EventsService ~ invitesList?.map ~ invite:', invite);
      const { invites, events }: any = invite;
      const { image, name: eventName, id }: any = events;
      const { callingCode, phoneNumber, name: recipientName } = invites;
      await this.whatsappService.sendEventReminder({
        callingCode,
        phoneNumber,
        text: `Hey ${recipientName}, \nPlease don't forget to join the upcoming event ${eventName}`,
        image,
        recipientName,
        eventName,
        eventId: id,
        contactId: invites?.id,
      });
    });

    return eventDetail;
  }

  public async scanEventInvite(code: string): Promise<IMessage> {
    if (isNull(code) || isUndefined(code)) {
      throw new BadRequestException(['Event invite code cannot be null']);
    }
    const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
      'event_invitess_contacts',
    );
    const inviteDetail = await queryBuilder
      .where('event_invitess_contacts.code = :code', { code: code })
      .leftJoinAndSelect('event_invitess_contacts.invites', 'invites')
      .leftJoinAndSelect('event_invitess_contacts.events', 'events')
      .select([
        'event_invitess_contacts',
        'events',
        'invites.id',
        'invites.name',
        'invites.callingCode',
        'invites.phoneNumber',
        'invites.email',
      ])
      .getOne();

    const totalAllowedGuests = +inviteDetail.numberOfGuests;
    const totalArrivedGuests = +inviteDetail.numberOfScans;
    if (totalArrivedGuests >= totalAllowedGuests) {
      throw new BadRequestException(
        'Guests scanned amount is more then guests amount!',
      );
    }

    if (totalArrivedGuests < totalAllowedGuests) {
      inviteDetail.numberOfScans = totalArrivedGuests + 1;
    }

    await this.eventInvitessContacts.save(inviteDetail);

    return this.commonService.generateMessage('Guest scan is successful!');
  }

  public async findEventById(id: string): Promise<any> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid event id: ' + parsedValue);
    }

    const eventItem: any = await this.eventsRepository
      .createQueryBuilder('events')
      .where('events.id = :id', { id: parsedValue })
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
    const stats = await this.eventInvitessContacts
      .createQueryBuilder('event_invitess_contacts')
      .where('event_invitess_contacts.eventId = :id', { id: id })
      .select(
        "SUM(event_invitess_contacts.status='pending')",
        'GuestNotInvited',
      )
      .addSelect(
        "SUM(event_invitess_contacts.status='invited')",
        'GuestInvited',
      )
      .addSelect(
        "SUM(event_invitess_contacts.status='confirmed')",
        'GuestConfirmed',
      )
      .addSelect(
        "SUM(event_invitess_contacts.status='rejected')",
        'GuestRejected',
      )
      .addSelect("SUM(event_invitess_contacts.haveChat='1')", 'GuestMessages')
      .addSelect('SUM(event_invitess_contacts.numberOfScans)', 'GuestScanned')
      .addSelect("SUM(event_invitess_contacts.status='failed')", 'GuestFailed')
      .groupBy('event_invitess_contacts.eventId')
      .getRawMany();
    eventItem['stats'] = await Promise.all(stats);
    return eventItem;
  }

  public async getContactList(
    eventId: string,
    pageOptionsDto: ContactsPageOptionsDto,
  ): Promise<PageDto<Contacts>> {
    console.log('pageOptionsDto', pageOptionsDto);

    const parsedValue = parseInt(eventId, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid event id: ' + parsedValue);
    }

    let query = `
            SELECT
                eic.contactsId AS event_invitess_contacts_contactsId
            FROM
                event_invitess_contacts eic
            WHERE
                eic.eventId = ?
            `;

    if (pageOptionsDto?.status !== 'all') {
      if (pageOptionsDto.status === 'scanned') {
        query += ` AND eic.numberOfScans > 0`;
      } else {
        query += ` AND eic.status = ?`;
      }
    }

    // console.log('query', query);

    const results = await this.connection.query(query, [
      parseInt(eventId, 10),
      pageOptionsDto?.status,
    ]);

    const contactIds = results.map(
      (result: any) => result.event_invitess_contacts_contactsId,
    );

    const contacts = await this.contacts.find({
      where: {
        id: In(contactIds),
      },
      order: { createdAt: pageOptionsDto.order },
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
    });

    const totalCount = await this.contacts.count({
      where: { id: In(contactIds) },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: totalCount,
      pageOptionsDto,
    });
    return new PageDto(contacts, pageMetaDto);
  }

  public async findOneById(id: number): Promise<Events> {
    const eventId = await this.eventsRepository.findOneBy({ id });
    console.log('🚀 ~ CardService ~ cardItem:', eventId);
    this.commonService.checkEntityExistence(eventId, 'event');
    return eventId;
  }

  public async findInviteOneById(
    id: number,
    eventId: number,
  ): Promise<EventInvitessContacts> {
    const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
      'event_invitess_contacts',
    );
    const invite = await queryBuilder
      .where('event_invitess_contacts.eventId = :id', { id: eventId })
      .andWhere('event_invitess_contacts.contactsId = :id', { id: id })
      .leftJoinAndSelect('event_invitess_contacts.invites', 'invites')
      .leftJoinAndSelect('event_invitess_contacts.events', 'events')
      .select([
        'event_invitess_contacts',
        'events',
        'invites.id',
        'invites.name',
        'invites.callingCode',
        'invites.phoneNumber',
        'invites.email',
      ])
      .getOne();
    return invite;
  }

  public async getEventsByUserId(
    id: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    const queryBuilder = this.eventsRepository.createQueryBuilder('events');
    queryBuilder
      .where('events.userId = :id', { id: id })
      .leftJoinAndSelect('events.user', 'user')
      .select(['events', 'user.id', 'user.firstName', 'user.lastName'])
      .orderBy('events.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.status !== '') {
      queryBuilder.andWhere('events.status like :status', {
        status: `%${pageOptionsDto.status}%`,
      });
    }
    if (pageOptionsDto.search) {
      queryBuilder.andWhere(
        '(events.name LIKE :search OR events.address LIKE :search)',
        { search: `%${pageOptionsDto.search}%` },
      );
    }

    const itemCount = await queryBuilder.getCount();
    let { entities }: any = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(await Promise.all(entities), pageMetaDto);
  }

  public async categorizeEvents(
    userId: number,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    const currentDate = new Date();
    const tenMinutesAgo = new Date(currentDate.getTime() - 10 * 60 * 1000); // 10 minutes ago
    const queryBuilder = this.eventsRepository.createQueryBuilder('events');
    queryBuilder
      .where('events.userId = :id', { id: userId })
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
      ]);

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    // Search
    if (pageOptionsDto.search) {
      queryBuilder.andWhere(
        '(events.name LIKE :search OR events.description LIKE :search)',
        { search: `%${pageOptionsDto.search}%` },
      );
    }

    let events: any[] = [];

    switch (pageOptionsDto?.filter) {
      case 'all':
        events = await queryBuilder
          .orderBy('events.createdAt', pageOptionsDto.order)
          .getMany();
        break;
      case 'draft':
        events = await queryBuilder
          .andWhere('events.status = :status', { status: 'draft' })
          .orderBy('events.createdAt', pageOptionsDto.order)
          .getMany();
        break;
      case 'upcoming':
        events = await queryBuilder
          .andWhere('events.eventDate > :currentDate', {
            currentDate: currentDate,
          })
          .orderBy('events.eventDate', pageOptionsDto.order)
          .getMany();
        break;
      case 'new':
        events = await queryBuilder
          .andWhere('events.createdAt > :tenMinutesAgo', {
            tenMinutesAgo: tenMinutesAgo,
          })
          .getMany();
        break;
      case 'attended':
        events = await queryBuilder
          .andWhere('invites.id = :userId', { userId: userId })
          .getMany();
        break;
      case 'missed':
        events = []; // Implement missed events logic
        break;
      default:
        throw new Error('Invalid event type');
    }

    const itemCount = await queryBuilder.getCount();
    for (const event of events) {
      const eventItem = await this.eventInvitessContacts
        .createQueryBuilder('event_invitess_contacts')
        .where('event_invitess_contacts.eventId = :id', { id: event?.id })
        .select(
          "SUM(event_invitess_contacts.status='pending')",
          'GuestNotInvited',
        )
        .addSelect(
          "SUM(event_invitess_contacts.status='invited')",
          'GuestInvited',
        )
        .addSelect(
          "SUM(event_invitess_contacts.status='confirmed')",
          'GuestConfirmed',
        )
        .addSelect(
          "SUM(event_invitess_contacts.status='rejected')",
          'GuestRejected',
        )
        .addSelect("SUM(event_invitess_contacts.haveChat='1')", 'GuestMessages')
        .addSelect('SUM(event_invitess_contacts.numberOfScans)', 'GuestScanned')
        .addSelect(
          "SUM(event_invitess_contacts.status='failed')",
          'GuestFailed',
        )
        .groupBy('event_invitess_contacts.eventId')
        .getRawMany();
      event.stats =
        eventItem.length > 0
          ? eventItem
          : [
              {
                GuestNotInvited: '0',
                GuestInvited: '0',
                GuestConfirmed: '0',
                GuestRejected: '0',
                GuestMessages: '0',
                GuestScanned: '0',
                GuestFailed: '0',
              },
            ];
    }

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(await Promise.all(events), pageMetaDto);
  }

  public async getGuestsByEventId(
    eventId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    if (isNull(eventId) || isUndefined(eventId)) {
      throw new BadRequestException(['Event id cannot be null']);
    }

    const rawQuery = `
            SELECT 
                event_invitess_contacts.status AS event_invitess_contacts_status, 
                event_invitess_contacts.numberOfScans AS event_invitess_contacts_numberOfScans, 
                event_invitess_contacts.numberOfGuests AS event_invitess_contacts_numberOfGuests, 
                event_invitess_contacts.usersId AS event_invitess_contacts_usersId, 
                event_invitess_contacts.eventId AS event_invitess_contacts_eventId, 
                event_invitess_contacts.code AS event_invitess_contacts_code, 
                event_invitess_contacts.notes AS event_invitess_contacts_notes, 
                event_invitess_contacts.haveChat AS event_invitess_contacts_haveChat, 
                event_invitess_contacts.selectedEvent AS event_invitess_contacts_selectedEvent, 
                event_invitess_contacts.sendList AS event_invitess_contacts_sendList, 
                event_invitess_contacts.createdAt AS event_invitess_contacts_createdAt, 
                event_invitess_contacts.updatedAt AS event_invitess_contacts_updatedAt, 
                event_invitess_contacts.deletedAt AS event_invitess_contacts_deletedAt, 
                event_invitess_contacts.contactsId AS event_invitess_contacts_contactsId, 
                invites.id AS invites_id, 
                invites.name AS invites_name, 
                invites.email AS invites_email, 
                invites.callingCode AS invites_callingCode, 
                invites.phoneNumber AS invites_phoneNumber, 
                events.id AS events_id, 
                events.name AS events_name, 
                events.image AS events_image, 
                events.status AS events_status, 
                events.notes AS events_notes, 
                events.eventDate AS events_eventDate, 
                events.showQRCode AS events_showQRCode, 
                events.nearby AS events_nearby, 
                events.address AS events_address, 
                events.latitude AS events_latitude, 
                events.longitude AS events_longitude, 
                events.code AS events_code, 
                events.createdAt AS events_createdAt, 
                events.updatedAt AS events_updatedAt, 
                events.deletedAt AS events_deletedAt, 
                events.userId AS events_userId 
            FROM 
                event_invitess_contacts 
            LEFT JOIN 
                contacts invites ON invites.id = event_invitess_contacts.contactsId AND invites.deletedAt IS NULL
            LEFT JOIN 
                events ON events.id = event_invitess_contacts.eventId AND events.deletedAt IS NULL 
            WHERE 
                event_invitess_contacts.eventId = ? 
                AND event_invitess_contacts.deletedAt IS NULL`;

    const queryBuilder = this.eventInvitessContacts.createQueryBuilder();
    const entities = await this.connection.query(rawQuery, [eventId]);
    const formattedData = entities.map((entity) => ({
      status: entity.event_invitess_contacts_status,
      numberOfScans: entity.event_invitess_contacts_numberOfScans,
      numberOfGuests: entity.event_invitess_contacts_numberOfGuests,
      usersId: entity.event_invitess_contacts_usersId,
      eventId: entity.event_invitess_contacts_eventId,
      code: entity.event_invitess_contacts_code,
      notes: entity.event_invitess_contacts_notes,
      haveChat: entity.event_invitess_contacts_haveChat,
      selectedEvent: entity.event_invitess_contacts_selectedEvent,
      sendList: entity.event_invitess_contacts_sendList,
      createdAt: entity.event_invitess_contacts_createdAt,
      updatedAt: entity.event_invitess_contacts_updatedAt,
      invites: {
        id: entity.invites_id,
        name: entity.invites_name,
        email: entity.invites_email,
        callingCode: entity.invites_callingCode,
        phoneNumber: entity.invites_phoneNumber,
      },
      events: {
        id: entity.events_id,
        name: entity.events_name,
        image: entity.events_image,
        status: entity.events_status,
        notes: entity.events_notes,
        eventDate: entity.events_eventDate,
        showQRCode: entity.events_showQRCode,
        address: entity.events_address,
        latitude: entity.events_latitude,
        longitude: entity.events_longitude,
        code: entity.events_code,
        createdAt: entity.events_createdAt,
        updatedAt: entity.events_updatedAt,
      },
    }));

    const itemCount = formattedData.length;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(formattedData, pageMetaDto);
  }

  async deleteRecordByEventAndContact(
    eventId: number,
    contactsId: number,
  ): Promise<IMessage> {
    const event: any = eventId;
    if (isNaN(event) && !isInt(event)) {
      throw new BadRequestException('Invalid event id: ' + event);
    }
    const contact: any = contactsId;
    if (isNaN(contact) && !isInt(contact)) {
      throw new BadRequestException('Invalid contact id: ' + contact);
    }
    //@ts-ignore
    await this.eventInvitessContacts.delete({
      eventId: event,
      invites: contact,
    });
    return this.commonService.generateMessage('Guest deleted successfully!');
  }

  public async getAllChatMessagesOfEvent(
    eventId: string,
    userId: string,
    contactId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    const queryBuilder = this.eventsChats.createQueryBuilder('events_chats');
    queryBuilder
      .where('events_chats.actionUserId = :actionUserId', {
        actionUserId: userId,
      })
      .andWhere('events_chats.eventId = :eventId', { eventId: eventId })
      .andWhere('events_chats.contactId = :contactId', { contactId: contactId })
      .leftJoinAndSelect('events_chats.contact', 'contact')
      .select([
        'events_chats',
        'contact.id',
        'contact.name',
        'contact.callingCode',
        'contact.phoneNumber',
      ])
      .orderBy('events_chats.createdAt', pageOptionsDto.order);

    const itemCount = await queryBuilder.getCount();
    let { entities }: any = await queryBuilder.getRawAndEntities();
    console.log('🚀 ~ EventsService ~ entities:', entities);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(await Promise.all(entities), pageMetaDto);
  }

  public async getAllChatsOfEvent(
    eventId: string,
    userId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
      'event_invitess_contacts',
    );
    queryBuilder
      .where('event_invitess_contacts.eventId = :id', { id: eventId })
      .andWhere('event_invitess_contacts.usersId = :userId', { userId: userId })
      .andWhere('event_invitess_contacts.haveChat = :haveChat', {
        haveChat: true,
      })
      .leftJoinAndSelect('event_invitess_contacts.invites', 'invites')
      .leftJoinAndSelect('event_invitess_contacts.events', 'events')
      .select([
        'event_invitess_contacts',
        'events',
        'invites.id',
        'invites.name',
        'invites.callingCode',
        'invites.phoneNumber',
        'invites.email',
      ]);

    const itemCount = await queryBuilder.getCount();
    let { entities }: any = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(await Promise.all(entities), pageMetaDto);
  }

  public async getAllChatsOfUser(
    userId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
      'event_invitess_contacts',
    );
    queryBuilder
      .where('event_invitess_contacts.usersId = :userId', { userId: userId })
      .andWhere('event_invitess_contacts.haveChat = :haveChat', {
        haveChat: true,
      })
      .leftJoinAndSelect('event_invitess_contacts.invites', 'invites')
      .leftJoinAndSelect('event_invitess_contacts.events', 'events')
      .select([
        'event_invitess_contacts',
        'events',
        'invites.id',
        'invites.name',
        'invites.callingCode',
        'invites.phoneNumber',
        'invites.email',
      ]);

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
      const uploadedFile = await this.uploaderService.uploadImage(
        1,
        file,
        ratio,
        fileType,
      );
      if (!isUndefined(uploadedFile) && !isNull(uploadedFile)) {
        return uploadedFile;
      }
    } catch (error) {
      console.log(
        '🚀 ~ file: users.service.ts:235 ~ UsersService ~ error',
        error,
      );
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

  public async update(
    eventId: string,
    dto: UpdateEventDto,
    actionUser = null,
  ): Promise<Events> {
    const {
      user: userId,
      contacts,
      name,
      image,
      eventDate,
      status,
      showQRCode,
      nearby,
      address,
      notes,
      latitude,
      longitude,
    } = dto;
    let contacts_ids = [];
    if (contacts?.length) {
      contacts_ids = await this.contactsService.getOrCreateContacts(
        contacts,
        userId,
      );
    }

    const parsedValue = parseInt(eventId, 10);
    const eventItem = await this.findOne({
      where: { id: parsedValue },
      relations: ['user', 'invites'],
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

      if (
        !isUndefined(contacts_ids) &&
        !isNull(contacts_ids) &&
        contacts_ids?.length
      ) {
        const newCandidates: any = contacts_ids.map((item) => {
          return {
            eventId: eventId,
            contactsId: Number(item?.id),
            usersId: eventCreator?.id,
            haveChat: false,
            numberOfGuests: item?.guestcount ? item?.guestcount + 1 : 1,
          };
        });

        // Construct the VALUES part of the SQL query dynamically.
        const values = newCandidates
          .map(
            (candidate) =>
              `(${candidate.contactsId}, ${candidate.eventId}, ${candidate.usersId},${candidate.haveChat})`,
          )
          .join(', ');

        // Construct the full INSERT query
        const query = `INSERT INTO event_invitess_contacts (contactsId, eventId, usersId,numberOfGuests) VALUES ${values};`;
        const results = await this.connection.query(query);
        console.log('🚀 ~ EventsService ~ update ~ results:', results);
      }
      const userDetail = await this.usersService.findOne({
        where: { id: eventCreator?.id },
      });

      eventItem.updatedAt = new Date();
      await this.eventsRepository.save(eventItem);
      return eventItem;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const errorMessage = error.message;
        console.log(
          '🚀 ~ file: event.service.ts:580 ~ EventService ~ update ~ errorMessage:',
          errorMessage,
        );
        const match = /Duplicate entry '(.+)' for key '(.+)'/i.exec(
          errorMessage,
        );

        if (match) {
          const duplicateValue = match[1];
          console.log(
            '🚀 ~ EventsService ~ update ~ duplicateValue:',
            duplicateValue,
          );
          const duplicateKey = match[2];
          const [event_id, contact_id] = duplicateValue.split('-');
          console.log(
            '🚀 ~ EventsService ~ update ~ event_id, contact_id:',
            event_id,
            contact_id,
          );

          const existingRecord: any = await this.contactsService.findOneByWhere(
            { id: In([contact_id]) },
          );
          // console.log("🚀 ~ file: assessment.service.ts:596 ~ AssessmentService ~ update ~ existingRecord:", existingRecord)
          throw new BadRequestException([
            {
              callingCode: existingRecord[0]?.callingCode,
              phoneNumber: existingRecord[0]?.phoneNumber,
            },
          ]);
        }
      } else {
        // Handle other errors.
        throw new BadRequestException([error?.message]);
      }
    }
  }

  public async eventsStats(): Promise<any> {
    const totalEvents = await this.eventsRepository.count();
    return { totalEvents };
  }

  public async getAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Events>> {
    const queryBuilder = this.eventsRepository.createQueryBuilder('events');

    queryBuilder
      .orderBy('events.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    // if (pageOptionsDto.search !== '') {
    //   queryBuilder.andWhere(
    //     '(events.status like :search OR' +
    //       ' events.firstName like :search OR' +
    //       ' events.lastName like :search OR' +
    //       ' events.email like :search)',
    //     { search: `%${pageOptionsDto.search}%` },
    //   );
    // }

    // if (pageOptionsDto.status !== '') {
    //   queryBuilder.andWhere('events.status like :status', {
    //     status: `%${pageOptionsDto.status}%`,
    //   });
    // }

    const itemCount = await queryBuilder.getCount();
    let { entities }: any = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async getUserEventCount(userId: number): Promise<number> {
    const queryBuilder = this.eventsRepository.createQueryBuilder('events');
    queryBuilder.where('events.userId = :id', { id: userId });

    const itemCount = await queryBuilder.getCount();

    return itemCount;
  }
}
