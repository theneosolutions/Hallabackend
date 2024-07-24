import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommonService } from '../common/common.service';
import { Contacts } from './entities/contacts.entity';
import { UsersService } from 'src/users/users.service';
import { Events } from 'src/events/entities/event.entity';
import { ITemplatedData } from './interfaces/template-data.interface';
import { readFileSync } from 'fs';
import { ITemplates } from './interfaces/templates.interface';
import Handlebars from 'handlebars';
import { join } from 'path';
import { EventInvitessContacts } from 'src/events/entities/events_invites_contacts.entity';
import * as qrcode from 'qrcode';
import nodeHtmlToImage from 'node-html-to-image';
import { ConfigService } from '@nestjs/config';
import { EventsChats } from 'src/events/entities/events_chats.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

const unirest = require('unirest');
const signale = require('signale');
const fs = require('fs');
const messageParser = require('./msg_parser');
const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');

@Injectable()
export class WhatsappService {
  private readonly accessToken = process.env.Meta_WA_accessToken;
  private readonly graphAPIVersion = 'v18.0';
  private readonly senderPhoneNumberId =
    process.env.Meta_WA_SenderPhoneNumberId;
  private baseUrl: any = `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneNumberId}`;
  private readonly WABA_ID = process.env.Meta_WA_wabaId;
  private readonly templates: ITemplates;
  private readonly domain: string;
  private newMessage = 0;

  constructor(
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    @InjectRepository(EventInvitessContacts)
    private readonly eventInvitessContacts: Repository<EventInvitessContacts>,
    @InjectRepository(EventsChats)
    private readonly eventsChats: Repository<EventsChats>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {
    this.domain = this.configService.get<string>('domain');
    this.templates = {
      invite: WhatsappService.parseTemplate('invite.hbs'),
    };
  }

  private static parseTemplate(
    templateName: string,
  ): Handlebars.TemplateDelegate<ITemplatedData> {
    const templateText = readFileSync(
      join(__dirname, '..', 'whatsapp', 'templates', templateName),
      'utf-8',
    );
    return Handlebars.compile<ITemplatedData>(templateText, { strict: true });
  }

  public async create(origin: string | undefined, body: any): Promise<any> {
    const data = this.parseMessage(body);
    try {
      if (Object.keys(data).length === 0) {
        return; // Return when no body found
      }

      if (data?.isMessage) {
        const incomingMessage = data.message;
        const recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
        const recipientName = incomingMessage.from.name;
        const typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
        const message_id = incomingMessage.message_id; // extract the message id

        switch (incomingMessage.type) {
          case 'text_message':
            await this.processTextMessage(
              incomingMessage,
              recipientPhone,
              recipientName,
              typeOfMsg,
              message_id,
            );
            break;
          case 'simple_button_message':
            await this.processButtonMessage(
              incomingMessage,
              recipientPhone,
              recipientName,
              typeOfMsg,
              message_id,
            );
            break;
          case 'radio_button_message':
            await this.processRadioButtonMessage(
              incomingMessage,
              recipientPhone,
              recipientName,
              typeOfMsg,
              message_id,
            );
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.log('🚀 ~ WhatsappService ~ create ~ error:', error);
    }
  }

  private async processTextMessage(
    incomingMessage: any,
    recipientPhone: any,
    recipientName: any,
    typeOfMsg: any,
    message_id: any,
  ): Promise<void> {
    if (typeOfMsg === 'text_message') {
      this.newMessage = 1;
      const contactInfo: any = await this.findByCombinedPhoneNumber(
        recipientPhone,
      );
      const userEvents: any = await this.findInviteByContactId(contactInfo?.id);
      if (userEvents.length == 1) {
        const invite = userEvents[0];
        if (invite.sendList) {
          await this.sendRadioButtons({
            recipientPhone: recipientPhone,
            headerText: 'How can i help?',
            bodyText: 'Please choose from the list',
            footerText: ' ',
            listOfSections: [
              {
                title: ' ',
                rows: [
                  {
                    title: 'Send message',
                    description: ' ',
                    id: `event-message_${invite?.eventId}_${invite?.invites?.id}`,
                  },
                  {
                    title: 'Re-send the invitaion',
                    description: ' ',
                    id: `event-invitaion_${invite?.eventId}_${invite?.invites?.id}`,
                  },
                  {
                    title: 'Re-send the location',
                    description: ' ',
                    id: `event-location_${invite?.eventId}_${invite?.invites?.id}`,
                  },
                  {
                    title: 'Other',
                    description: ' ',
                    id: `other_${invite?.eventId}_${invite?.invites?.id}`,
                  },
                ],
              },
            ],
          });
          invite.sendList = false;
          await this.eventInvitessContacts.save(invite);
          setTimeout(async () => {
            invite.sendList = true;
            await this.eventInvitessContacts.save(invite);
          }, 2000);
        } else {
          const message = {
            action: 'message',
            actionData: incomingMessage?.text?.body,
            actionType: 'text',
            actionUser: invite?.usersId,
            contact: invite?.invites?.id,
            event: invite?.eventId,
            sentBy: invite?.invites?.id,
          };
          console.log('🚀 ~ WhatsappService ~ create ~ message:', message);
          const chat = this.eventsChats.create(message);
          await this.eventsChats.insert(chat);
          this.emitEvent('chat', chat);
          invite.sendList = true;
          invite.haveChat = true;
          await this.eventInvitessContacts.save(invite);
          this.sendText({
            message: 'Thank you.Message is sent to event creator',
            recipientPhone: recipientPhone,
          });

          userEvents?.map(async (invite: any) => {
            invite.sendList = true;
            invite.selectedEvent = false;
            await this.eventInvitessContacts.save(invite);
          });
        }
      } else {
        const sendMessage = [];
        userEvents?.map((invite: any) => {
          if (invite?.selectedEvent) {
            sendMessage.push(invite);
          }
        });
        if (sendMessage.length == 1) {
          const inviteDetail = sendMessage[0];
          const message = {
            action: 'message',
            actionData: incomingMessage?.text?.body,
            actionType: 'text',
            actionUser: inviteDetail?.usersId,
            contact: inviteDetail?.invites?.id,
            event: inviteDetail?.eventId,
            sentBy: inviteDetail?.invites?.id,
          };
          console.log('🚀 ~ WhatsappService ~ create ~ message:', message);
          const chat = this.eventsChats.create(message);
          await this.eventsChats.insert(chat);
          this.emitEvent('chat', chat);
          inviteDetail.sendList = true;
          inviteDetail.haveChat = true;
          await this.eventInvitessContacts.save(inviteDetail);
          this.sendText({
            message: 'Thank you.Message is sent to event creator',
            recipientPhone: recipientPhone,
          });
          userEvents?.map(async (invite: any) => {
            inviteDetail.sendList = true;
            inviteDetail.selectedEvent = false;
            await this.eventInvitessContacts.save(inviteDetail);
          });
        } else {
          const rows = userEvents?.map((invite: any) => {
            return {
              title: invite?.events?.name,
              description: ' ',
              id: `event-selected_${invite?.eventId}_${invite?.invites?.id}`,
            };
          });

          await this.sendRadioButtons({
            recipientPhone: recipientPhone,
            headerText: 'How can i help?',
            bodyText: 'Please choose from the list',
            footerText: ' ',
            listOfSections: [
              {
                title: ' ',
                rows: rows,
              },
            ],
          });
        }
      }
    }
  }

  private async processButtonMessage(
    incomingMessage: any,
    recipientPhone: string,
    recipientName: string,
    typeOfMsg: string,
    message_id: string,
  ): Promise<void> {
    try {
      if (typeOfMsg === 'simple_button_message') {
        const button_id = incomingMessage.button_reply?.id;
        if (!button_id) {
          console.error('Button ID not found in the incoming message.');
          return;
        }

        const button_event = button_id.split('_');
        const eventType = button_event[0];

        switch (eventType) {
          case 'event-confirm':
            await this.handleConfirmEventButton(button_event, recipientPhone);
            break;
          case 'event-location':
            await this.handleLocationEventButton(button_event, recipientPhone);
            break;
          case 'event-decline':
            await this.handleDelineEventButton(button_event, recipientPhone);
            break;
          case 'event-deline-no':
            await this.handleDelineNoEventButton(recipientPhone);
            break;
          case 'event-deline-yes':
            await this.handleDelineYesEventButton(button_event, recipientPhone);
            break;
          case 'other':
            await this.handleOtherButton(recipientPhone);
            break;
          default:
            console.error('Unknown button event type:', eventType);
            break;
        }
      }
    } catch (error) {
      console.error('Error processing button message:', error);
      // Handle error cases...
    }
  }

  private async handleConfirmEventButton(
    button_event: any[],
    recipientPhone: string,
  ): Promise<void> {
    const invite: any = await this.findInviteOneById(
      button_event[2],
      button_event[1],
    );
    if (!invite) {
      console.error('Invite not found for confirmation button event.');
      return;
    }
    const url = `https://${this.domain}/events/scan-qrcode/${invite?.code}`;
    const qrCodeDataURL = await this.generateQrCode(url);
    const html = this.templates.invite({
      guests: String(invite?.numberOfGuests),
      qrCodeDataURL: qrCodeDataURL,
    });
    const nodeHtmlToImageOptions: any = {
      output: join(__dirname, '..', '..', 'qrcodes', `${invite?.code}.png`),
      html: html,
    };
    // Added 'puppeteerArgs' to resolve issue at server side for creating PNG 
    // Check the path where 'chromium-browser' is installed using command `which chromium-browser`
    // Paste that path at line #354
    if (process.env.NODE_ENV != 'development') {
      nodeHtmlToImageOptions.puppeteerArgs = {
        executablePath: '/usr/bin/chromium-browser',
      };
    }
    nodeHtmlToImage(nodeHtmlToImageOptions).then(async () => {
      const imageResponse: any = await this.sendImage({
        recipientPhone: recipientPhone,
        caption: `Please use this code to access (${invite?.events?.name}),make sure to save the image before it expire.`,
        url: `https://${this.domain}/events/qrcodes/${invite?.code}.png`,
      });
      if (imageResponse && imageResponse?.error) {
        console.error('Error sending image:', imageResponse?.error);
      }
      invite.status = 'confirmed';
      await this.eventInvitessContacts.save(invite);
    });
  }

  private async handleLocationEventButton(
    button_event: any[],
    recipientPhone: string,
  ): Promise<void> {
    const event = await this.findEventOneById(button_event[1]);
    if (!event) {
      console.error('Event not found for location button event.');
      return;
    }

    await this.sendLocation({
      recipientPhone: recipientPhone,
      latitude: event?.latitude,
      longitude: event?.longitude,
      name: event?.address,
      address: event?.address,
    });
  }

  private async handleDelineEventButton(
    button_event: any[],
    recipientPhone: string,
  ): Promise<void> {
    const invite: any = await this.findInviteOneById(
      button_event[2],
      button_event[1],
    );
    if (!invite) {
      console.error('Invite not found for delineation button event.');
      return;
    }
    await this.sendSimpleButtons({
      message: `Thank you, your reply had been sent to the host.\nWould you like to send a message?`,
      recipientPhone: recipientPhone,
      listOfButtons: [
        {
          title: 'Yes',
          id: `event-deline-yes_${invite?.eventId}_${invite?.invites?.id}`,
        },
        {
          title: 'No',
          id: `event-deline-no_${invite?.eventId}_${invite?.invites?.id}`,
        },
      ],
    });
    invite.status = 'rejected';
    await this.eventInvitessContacts.save(invite);
  }

  private async handleDelineNoEventButton(
    recipientPhone: string,
  ): Promise<void> {
    // Send thank you message for declining...
    await this.sendText({
      message: 'Thank you',
      recipientPhone: recipientPhone,
    });
  }

  private async handleDelineYesEventButton(
    button_event: any[],
    recipientPhone: string,
  ): Promise<void> {
    const invite = await this.findInviteOneById(
      button_event[2],
      button_event[1],
    );
    if (!invite) {
      console.error('Invite not found for delineation (yes) button event.');
      return;
    }

    // Update invite properties...
    invite.selectedEvent = true;
    invite.sendList = false;
    await this.eventInvitessContacts.save(invite);

    // Prompt user to enter a message...
    await this.sendText({
      message: 'Please enter your message. Only text is allowed.',
      recipientPhone: recipientPhone,
    });
  }

  private async handleOtherButton(recipientPhone: string): Promise<void> {
    this.sendText({
      message:
        'Welcome to Halla Electronic invitaions! We are here to assist you.To speek with our customer serviceteam, please click on the link below.',
      recipientPhone: recipientPhone,
    });
  }

  private async processRadioButtonMessage(
    incomingMessage: any,
    recipientPhone: any,
    recipientName: any,
    typeOfMsg: any,
    message_id: any,
  ): Promise<void> {
    if (typeOfMsg !== 'radio_button_message') return;

    const button_id = incomingMessage.list_reply?.id;
    if (!button_id) return;

    const button_event = button_id.split('_');

    try {
      switch (button_event[0]) {
        case 'event-selected':
          await this.handleEventSelected(
            button_event[1],
            button_event[2],
            recipientPhone,
          );
          break;
        case 'event-location':
          await this.handleEventLocation(button_event[1], recipientPhone);
          break;
        case 'event-message':
          await this.handleEventMessage(
            button_event[1],
            button_event[2],
            recipientPhone,
          );
          break;
        case 'event-invitaion':
          await this.handleEventInvitation(
            button_event[1],
            button_event[2],
            recipientPhone,
            recipientName,
          );
          break;
        case 'other':
          this.handleOther(recipientPhone);
          break;
        default:
          console.error('Invalid button event type:', button_event[0]);
      }
    } catch (error) {
      console.error('Error processing radio button message:', error);
    }
  }

  private async handleEventSelected(
    eventId: string,
    inviteId: string,
    recipientPhone: any,
  ): Promise<void> {
    const invite: any = await this.findInviteOneById(
      Number(inviteId),
      Number(eventId),
    );
    invite.selectedEvent = true;
    invite.sendList = false;
    await this.eventInvitessContacts.save(invite);

    await this.sendRadioButtons({
      recipientPhone: recipientPhone,
      headerText: 'How can I help?',
      bodyText: 'Please choose from the list',
      footerText: ' ',
      listOfSections: [
        {
          title: ' ',
          rows: [
            {
              title: 'Send message',
              description: ' ',
              id: `event-message_${invite?.eventId}_${invite?.invites?.id}`,
            },
            {
              title: 'Re-send the invitation',
              description: ' ',
              id: `event-invitaion_${invite?.eventId}_${invite?.invites?.id}`,
            },
            {
              title: 'Re-send the location',
              description: ' ',
              id: `event-location_${invite?.eventId}_${invite?.invites?.id}`,
            },
            {
              title: 'Other',
              description: ' ',
              id: `other_${invite?.eventId}_${invite?.invites?.id}`,
            },
          ],
        },
      ],
    });

    invite.sendList = false;
    await this.eventInvitessContacts.save(invite);

    setTimeout(async () => {
      invite.sendList = true;
      await this.eventInvitessContacts.save(invite);
    }, 2000);
  }

  private async handleEventLocation(
    eventId: string,
    recipientPhone: any,
  ): Promise<void> {
    const event = await this.findEventOneById(Number(eventId));
    if (!event) return;

    await this.sendLocation({
      recipientPhone: recipientPhone,
      latitude: event.latitude,
      longitude: event.longitude,
      name: event.address,
      address: event.address,
    });
  }

  private async handleEventMessage(
    eventId: string,
    inviteId: string,
    recipientPhone: any,
  ): Promise<void> {
    const invite: any = await this.findInviteOneById(
      Number(inviteId),
      Number(eventId),
    );
    invite.selectedEvent = true;
    invite.sendList = false;
    await this.eventInvitessContacts.save(invite);

    this.sendText({
      message: 'Please enter your message. Only text is allowed.',
      recipientPhone: recipientPhone,
    });
  }

  private async handleEventInvitation(
    eventId: string,
    inviteId: string,
    recipientPhone: any,
    recipientName: any,
  ): Promise<void> {
    const invite: any = await this.findInviteOneById(
      Number(inviteId),
      Number(eventId),
    );
    const { invites, events }: any = invite;
    const { image, name: eventName, id }: any = events;
    const { callingCode, phoneNumber, name }: any = invites;

    // const imageResponse: any = await this.sendImage({
    //   recipientPhone: recipientPhone,
    //   url: image,
    // });

    // if (imageResponse && imageResponse?.error) {
    //   console.error('Error sending image:', imageResponse?.error);
    // }
    console.log('Handling event inivation >>>>>>>>>>>>');
    await this.sendSimpleButtonsWithImage({
      url: image,
      message: `Hey ${recipientName}, \nWe are pleased to invite you to ${eventName}.`,
      recipientPhone: recipientPhone,
      listOfButtons: [
        {
          title: 'Confirm',
          id: `event-confirm_${invite?.eventId}_${invite?.invites?.id}`,
        },
        {
          title: 'Decline',
          id: `event-decline_${invite?.eventId}_${invite?.invites?.id}`,
        },
        {
          title: 'Event Location',
          id: `event-location_${invite?.eventId}_${invite?.invites?.id}`,
        },
      ],
    });
  }

  private async handleOther(recipientPhone: any): Promise<void> {
    this.sendText({
      message:
        'Welcome to Halla Electronic invitations! We are here to assist you. To speak with our customer service team, please click on the link below.',
      recipientPhone: recipientPhone,
    });
  }

  public async sendInviteToGuest(body: any): Promise<any> {
    const {
      callingCode,
      phoneNumber,
      text,
      image,
      recipientName,
      eventName,
      eventId,
      contactId,
    } = body;
    const recipientPhone = `${callingCode.replace('+', '')}${phoneNumber}`;

    try {
      if (image) {
        const imageResponse: any = await this.sendImage({
          recipientPhone: recipientPhone,
          caption: text,
          url: image,
        });

        // Check if there's any error in sending image
        if (imageResponse && imageResponse?.error) {
          console.error('Error sending image:', imageResponse?.error);
        }
        console.log(
          'sendImage is called from sendInviteToGuest <<<<<<<<<<<<<<<',
        );
      }

      const response = await this.sendSimpleButtons({
        message: text,
        recipientPhone: recipientPhone,
        listOfButtons: [
          { title: 'Confirm', id: `event-confirm_${eventId}_${contactId}` },
          { title: 'Decline', id: `event-decline_${eventId}_${contactId}` },
          {
            title: 'Event Location',
            id: `event-location_${eventId}_${contactId}`,
          },
        ],
      });

      console.log(
        '🚀 ~ WhatsappService ~ sendInviteToGuest ~ response:',
        response,
      );
      return response;
    } catch (error) {
      console.error('Error sending invite to guest:', error);
      return error;
    }
  }

  public async sendEventReminder(body: any): Promise<any> {
    const { callingCode, phoneNumber, text } = body;
    const recipientPhone = `${callingCode.replace('+', '')}${phoneNumber}`;

    try {
      const response = await this.sendText({
        message: text,
        recipientPhone: recipientPhone,
      });

      console.log(
        '🚀 ~ WhatsappService ~ sendInviteToGuest ~ response:',
        response,
      );
      return response;
    } catch (error) {
      console.error('Error sending invite to guest:', error);
      return error;
    }
  }

  public async findEventOneById(id: number): Promise<Events> {
    const eventId = await this.eventsRepository.findOneBy({ id });
    console.log('🚀 ~ CardService ~ cardItem:', eventId);
    this.commonService.checkEntityExistence(eventId, 'event');
    return eventId;
  }

  public async saveAndSendMessage(payload: any): Promise<any> {
    try {
      const { event, contact, actionUser } = payload;
      const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
        'event_invitess_contacts',
      );
      const invite: any = await queryBuilder
        .where('event_invitess_contacts.eventId = :eventId', { eventId: event })
        .andWhere('event_invitess_contacts.contactsId = :contactsId', {
          contactsId: contact,
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
        ])
        .getOne();

      const chat = this.eventsChats.create(payload);
      await this.eventsChats.insert(chat);
      this.sendText({
        message: payload?.actionData,
        recipientPhone: `${invite?.invites?.callingCode}${invite?.invites?.phoneNumber}`,
      });
      return chat;
    } catch (error) {
      console.log('🚀 ~ WhatsappService ~ saveAndSendMessage ~ error:', error);
    }
  }

  public async findInviteOneById(
    id: number,
    eventId: number,
  ): Promise<EventInvitessContacts> {
    const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
      'event_invitess_contacts',
    );
    const invite = await queryBuilder
      .where('event_invitess_contacts.eventId = :eventId', { eventId: eventId })
      .andWhere('event_invitess_contacts.contactsId = :contactsId', {
        contactsId: id,
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
      ])
      .getOne();
    console.log('🚀 ~ WhatsappService ~ invite:', invite);
    return invite;
  }

  public async findInviteByContactId(
    id: number,
  ): Promise<EventInvitessContacts[]> {
    const queryBuilder = this.eventInvitessContacts.createQueryBuilder(
      'event_invitess_contacts',
    );
    const invite = await queryBuilder
      .where('event_invitess_contacts.contactsId = :contactsId', {
        contactsId: id,
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
      ])
      .getMany();
    return invite;
  }

  public async sendText({ message, recipientPhone }) {
    try {
      this._mustHaverecipientPhone(recipientPhone);
      this._mustHaveMessage(message);
      const body = {
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      };

      const response = await this._fetchAssistant({
        url: '/messages',
        method: 'POST',
        body,
      });

      return response;
    } catch (error) {
      console.log('🚀 ~ WhatsappService ~ sendText ~ error:', error);
    }
  }

  public async emitEvent(event: string, data: any): Promise<void> {
    const server = this.socketGateway.getServerInstance();
    if (server) {
      // console.log("🚀 ~ WhatsappService ~ create ~ chat:", data)
      server.emit(event, data);
    } else {
      console.error('Server instance not available');
    }
  }

  async sendRadioButtons({
    recipientPhone,
    headerText,
    bodyText,
    footerText,
    listOfSections,
  }) {
    this._mustHaverecipientPhone(recipientPhone);

    if (!bodyText)
      throw new Error('"bodyText" is required in making a request');
    if (!headerText)
      throw new Error('"headerText" is required in making a request');
    if (!footerText)
      throw new Error('"footerText" is required in making a request');

    let totalNumberOfItems = 0;
    const validSections = listOfSections
      .map((section) => {
        const title = section.title;
        const rows = section.rows?.map((row) => {
          if (!row.id) {
            throw new Error(
              '"row.id" of an item is required in list of radio buttons.',
            );
          }
          if (row.id.length > 200) {
            throw new Error(
              'The row id must be between 1 and 200 characters long.',
            );
          }
          if (!row.title) {
            throw new Error(
              '"row.title" of an item is required in list of radio buttons.',
            );
          }
          if (row.title.length > 24) {
            throw new Error(
              'The row title must be between 1 and 24 characters long.',
            );
          }
          if (!row.description) {
            throw new Error(
              '"row.description" of an item is required in list of radio buttons.',
            );
          }
          if (row.description.length > 72) {
            throw new Error(
              'The row description must be between 1 and 72 characters long.',
            );
          }

          totalNumberOfItems += 1;

          return {
            id: row.id,
            title: row.title,
            description: row.description,
          };
        });
        if (!title) {
          throw new Error(
            '"title" of a section is required in list of radio buttons.',
          );
        }
        return {
          title,
          rows,
        };
      })
      .filter(Boolean);

    if (totalNumberOfItems > 10) {
      throw new Error(
        'The total number of items in the rows must be equal or less than 10.',
      );
    }

    const samples = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: headerText,
        },
        body: {
          text: bodyText,
        },
        footer: {
          text: footerText,
        },
        action: {
          button: 'List',
          sections: validSections,
        },
      },
    };

    if (validSections.length === 0) {
      throw new Error('"listOfSections" is required in making a request');
    }

    const response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body: samples,
    });

    return response;
  }

  public async findByCombinedPhoneNumber(
    phoneNumber: string,
  ): Promise<Contacts> {
    const combinedPhoneNumber = `+${phoneNumber}`;

    return await this.contactsRepository
      .createQueryBuilder('contacts')
      .where(
        'CONCAT(contacts.callingCode, contacts.phoneNumber) = :combinedPhoneNumber',
        { combinedPhoneNumber },
      )
      .getOne();
  }

  private async generateQrCode(data: string): Promise<string> {
    try {
      const qrCodeDataURL = await qrcode.toDataURL(data);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code.');
    }
  }

  private async _fetchAssistant({ baseUrl, url, method, headers, body }: any) {
    return new Promise((resolve, reject) => {
      const defaultHeaders = () => {
        const output = {
          'Content-Type': 'application/json',
          'Accept-Language': 'en_US',
          Accept: 'application/json',
        };
        if (this.accessToken) {
          output['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return output;
      };
      const defaultBody = {};
      const defaultMethod = 'GET';

      if (!url) {
        throw new Error('"url" is required in making a request');
      }

      if (!method) {
        signale.warn(
          `WARNING: "method" is missing. The default method will default to ${defaultMethod}. If this is not what you want, please specify the method.`,
        );
      }

      if (!headers) {
        signale.warn(`WARNING: "headers" is missing.`);
      }

      if (method?.toUpperCase() === 'POST' && !body) {
        signale.warn(
          `WARNING: "body" is missing. The default body will default to ${JSON.stringify(
            defaultBody,
          )}. If this is not what you want, please specify the body.`,
        );
      }

      method = method?.toUpperCase() || defaultMethod;
      headers = {
        ...defaultHeaders(),
        ...headers,
      };
      body = body || defaultBody;
      this.baseUrl = baseUrl || this.baseUrl;
      const fullUrl = `${this.baseUrl}${url}`;

      unirest(method, fullUrl)
        .headers(headers)
        .send(JSON.stringify(body))
        .end(function (res) {
          if (res.error) {
            const errorObject = () => {
              try {
                return res.body?.error || JSON.parse(res.raw_body);
              } catch (e) {
                return {
                  error: res.raw_body,
                };
              }
            };
            reject({
              status: 'failed',
              ...errorObject(),
            });
          } else {
            resolve({
              status: 'success',
              data: res.body,
            });
          }
        });
    });
  }

  async sendSimpleButtonsWithImage({
    recipientPhone,
    url,
    message,
    listOfButtons,
  }) {
    this._mustHaverecipientPhone(recipientPhone);

    if (!listOfButtons) throw new Error('listOfButtons cannot be empty');
    if (listOfButtons.length > 3)
      throw new Error('listOfButtons cannot be bigger than 3 elements');

    const validButtons = listOfButtons
      .map((button) => {
        if (!button.title) {
          throw new Error('"title" is required in making a request.');
        }
        if (button.title.length > 20) {
          throw new Error(
            'The button title must be between 1 and 20 characters long.',
          );
        }
        if (!button.id) {
          throw new Error('"id" is required in making a request.');
        }
        if (button.id.length > 256) {
          throw new Error(
            'The button id must be between 1 and 256 characters long.',
          );
        }

        return {
          type: 'reply',
          reply: {
            title: button.title,
            id: button.id,
          },
        };
      })
      .filter(Boolean);

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'image',
          url: url,
        },
        body: {
          text: message,
        },
        action: {
          buttons: validButtons,
        },
      },
    };

    const response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }


  async sendSimpleButtons({ recipientPhone, message, listOfButtons }) {
    this._mustHaveMessage(message);
    this._mustHaverecipientPhone(recipientPhone);

    if (!listOfButtons) throw new Error('listOfButtons cannot be empty');
    if (listOfButtons.length > 3)
      throw new Error('listOfButtons cannot be bigger than 3 elements');

    const validButtons = listOfButtons
      .map((button) => {
        if (!button.title) {
          throw new Error('"title" is required in making a request.');
        }
        if (button.title.length > 20) {
          throw new Error(
            'The button title must be between 1 and 20 characters long.',
          );
        }
        if (!button.id) {
          throw new Error('"id" is required in making a request.');
        }
        if (button.id.length > 256) {
          throw new Error(
            'The button id must be between 1 and 256 characters long.',
          );
        }

        return {
          type: 'reply',
          reply: {
            title: button.title,
            id: button.id,
          },
        };
      })
      .filter(Boolean);

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: message,
        },
        action: {
          buttons: validButtons,
        },
      },
    };

    const response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }

  async sendImage({ recipientPhone, caption = '', url }) {
    this._mustHaverecipientPhone(recipientPhone);

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'image',
      image: {
        link: url,
        caption: caption || '',
      },
    };

    const response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body,
    });

    return {
      response,
      body,
    };
  }

  async sendLocation({ recipientPhone, latitude, longitude, name, address }) {
    this._mustHaverecipientPhone(recipientPhone);
    if (!latitude || !longitude) {
      throw new Error(
        '"latitude" and "longitude" are required in making a request',
      );
    }

    if (!name || !address) {
      throw new Error('"name" and "address" are required in making a request');
    }

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'location',
      location: {
        latitude,
        longitude,
        name,
        address,
      },
    };

    const response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }

  private _mustHaverecipientPhone(recipientPhone) {
    if (!recipientPhone) {
      throw new Error('"recipientPhone" is required in making a request');
    }
  }
  private _mustHaveMessage(message) {
    if (!message) {
      throw new Error('"message" is required in making a request');
    }
  }

  private _mustHaveTemplateName(templateName) {
    if (!templateName) {
      throw new Error('"templateName" is required in making a request');
    }
  }
  private _mustHaveComponents(components) {
    if (!components) {
      throw new Error('"components" is required in making a request');
    }
  }
  private _mustHaveLanguageCode(languageCode) {
    if (!languageCode) {
      throw new Error('"languageCode" is required in making a request');
    }
  }
  private _mustHaveMessageId(messageId) {
    if (!messageId) {
      throw new Error('"messageId" is required in making a request');
    }
  }

  private parseMessage(requestBody: any) {
    return messageParser({ requestBody, currentWABA_ID: this.WABA_ID });
  }
}
