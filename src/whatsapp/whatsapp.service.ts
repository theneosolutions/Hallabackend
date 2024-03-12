
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Contacts } from './entities/contacts.entity';
import { UpdateContactsDto } from './dtos/update-contacts.dto';
import { isInt } from 'class-validator';
import { SLUG_REGEX } from '../common/consts/regex.const';
import { ContactsDto } from './dtos/create-contacts';
import { UsersService } from 'src/users/users.service';
import { Events } from 'src/events/entities/event.entity';
import { EventsService } from 'src/events/events.service';
import { ITemplatedData } from './interfaces/template-data.interface';
import { readFileSync } from 'fs';
import { ITemplates } from './interfaces/templates.interface';
import Handlebars from 'handlebars';
import { join } from 'path';
import { EventInvitessContacts } from 'src/events/entities/events_invites_contacts.entity';
import * as qrcode from 'qrcode';
import nodeHtmlToImage from 'node-html-to-image'
import { ConfigService } from '@nestjs/config';
import { eventNames } from 'process';
import { EventsChats } from 'src/events/entities/events_chats.entity';
import { ChatGateway } from 'src/chat/chat.gateway';


const unirest = require('unirest');
const signale = require('signale');
const fs = require('fs');
const messageParser = require('./msg_parser');
const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');


@Injectable()
export class WhatsappService {

  private readonly accessToken = process.env.Meta_WA_accessToken;
  private readonly graphAPIVersion = 'v18.0';
  private readonly senderPhoneNumberId = process.env.Meta_WA_SenderPhoneNumberId;
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
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
    private readonly chatGateway: ChatGateway
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
    let data = this.parseMessage(body);

    if (data?.isMessage) {
      let incomingMessage = data.message;
      console.log("🚀 ~ WhatsappService ~ create ~ incomingMessage:", incomingMessage)
      let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
      let recipientName = incomingMessage.from.name;
      let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
      let message_id = incomingMessage.message_id; // extract the message id
      let previousRecipientPhone = ''

      if (previousRecipientPhone == recipientPhone) return

      if (typeOfMsg === 'text_message') {
        this.newMessage = 1;
        const contactInfo: any = await this.findByCombinedPhoneNumber(recipientPhone);
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
                }
              ],
            });
            invite.sendList = false;
            await this.eventInvitessContacts.save(invite);
            setTimeout(async () => {
              invite.sendList = true;
              await this.eventInvitessContacts.save(invite);
            }, 2000)
          } else {
            const message = {
              action: 'message',
              actionData: incomingMessage?.text?.body,
              actionType: 'text',
              actionUser: invite?.usersId,
              contact: invite?.invites?.id,
              event: invite?.eventId
            }
            console.log("🚀 ~ WhatsappService ~ create ~ message:", message)
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

          }
        } else {
          const sendMessage = []
          userEvents?.map((invite:any)=>{
            if(invite?.selectedEvent){
              sendMessage.push(invite)
            }
          })
          if(sendMessage.length == 1){
            const inviteDetail = sendMessage[0]
            const message = {
              action: 'message',
              actionData: incomingMessage?.text?.body,
              actionType: 'text',
              actionUser: inviteDetail?.usersId,
              contact: inviteDetail?.invites?.id,
              event: inviteDetail?.eventId
            }
            console.log("🚀 ~ WhatsappService ~ create ~ message:", message)
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
            userEvents?.map(async (invite:any)=>{
              inviteDetail.sendList = true;
              inviteDetail.selectedEvent = false;
              await this.eventInvitessContacts.save(inviteDetail);
            })

          }else {
            const rows = userEvents?.map((invite:any)=>{
              return {
                title: invite?.events?.name,
                description: ' ',
                id: `event-selected_${invite?.eventId}_${invite?.invites?.id}`,
              }
            })
  
            await this.sendRadioButtons({
              recipientPhone: recipientPhone,
              headerText: 'How can i help?',
              bodyText: 'Please choose from the list',
              footerText: ' ',
              listOfSections: [
                {
                  title: ' ',
                  rows: rows,
                }
              ],
            });
          }
         

        }

      }

      if (typeOfMsg === 'simple_button_message') {
        let button_id = incomingMessage.button_reply.id;
        const button_event = button_id?.split('_')


        if (button_event[0] === 'event-confirm') {
          const invite: any = await this.findInviteOneById(button_event[2], button_event[1]);
          const url = `https://${this.domain}/api/events/scan-qrcode/${invite?.code}`
          const qrCodeDataURL = await this.generateQrCode(url);
          const html = this.templates.invite({
            guests: String(invite?.numberOfGuests),
            qrCodeDataURL: qrCodeDataURL,
          });
          nodeHtmlToImage({
            output: join(__dirname, '..', '..', 'qrcodes', `${invite?.code}.png`),
            html: html
          })
            .then(() => console.log('The image was created successfully!'))
          await this.sendImage({
            recipientPhone: recipientPhone,
            caption: `Please use this code to access (${invite?.events?.name}),make sure to save the image before it expire.`,
            url: `https://${this.domain}/api/events/qrcodes/${invite?.code}.png`,
          });
          invite.status = 'confirmed'
          await this.eventInvitessContacts.save(invite);

        }

        if (button_event[0] === 'event-location') {
          const event = await this.findEventOneById(button_event[1]);
          await this.sendLocation({
            recipientPhone: recipientPhone,
            latitude: event?.latitude,
            longitude: event?.longitude,
            name: event?.address,
            address: event?.address,
          });

        }

        if (button_event[0] === 'event-deline') {
          const invite: any = await this.findInviteOneById(button_event[2], button_event[1]);
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

        if (button_event[0] === 'event-deline-no') {
          this.sendText({
            message: 'Thank you',
            recipientPhone: recipientPhone,
          });

        }

        if (button_event[0] === 'event-deline-yes') {
          const invite: any = await this.findInviteOneById(button_event[2], button_event[1]);
          invite.selectedEvent = true;
          invite.sendList = false;
          await this.eventInvitessContacts.save(invite);
          this.sendText({
            message: 'Please enter your message.Only text is allowed.',
            recipientPhone: recipientPhone,
          });

        }


        if (button_event[0] === 'other') {
          this.sendText({
            message: 'Welcome to Halla Electronic invitaions! We are here to assist you.To speek with our customer serviceteam, please click on the link below.',
            recipientPhone: recipientPhone,
          });

        }

      };
      if (typeOfMsg === 'radio_button_message') {
        let button_id = incomingMessage.list_reply.id;
        const button_event = button_id?.split('_')

        if (button_event[0] === 'event-selected') {
          const invite: any = await this.findInviteOneById(button_event[2], button_event[1]);
          invite.selectedEvent = true;
          invite.sendList = false;
          await this.eventInvitessContacts.save(invite);
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
              }
            ],
          });
          invite.sendList = false;
          await this.eventInvitessContacts.save(invite);
          setTimeout(async () => {
            invite.sendList = true;
            await this.eventInvitessContacts.save(invite);
          }, 2000)

        }

        if (button_event[0] === 'event-location') {
          const event = await this.findEventOneById(button_event[1]);
          await this.sendLocation({
            recipientPhone: recipientPhone,
            latitude: event?.latitude,
            longitude: event?.longitude,
            name: event?.address,
            address: event?.address,
          });

        }

        if (button_event[0] === 'event-message') {
          const invite: any = await this.findInviteOneById(button_event[2], button_event[1]);
          invite.selectedEvent = true;
          invite.sendList = false;
          await this.eventInvitessContacts.save(invite);
          this.sendText({
            message: 'Please enter your message.Only text is allowed.',
            recipientPhone: recipientPhone,
          });

        }

        if (button_event[0] === 'event-invitaion') {
          const invite: any = await this.findInviteOneById(button_event[2], button_event[1]);
          console.log("🚀 ~ WhatsappService ~ create ~ button_event[2], button_event[1]:", button_event[2], button_event[1])
          console.log("🚀 ~ WhatsappService ~ create ~ invite:", invite)
          const { invites, events }: any = invite;
          const { image, name: eventName, id }: any = events
          const { callingCode, phoneNumber, name: recipientName, } = invites;

          await this.sendImage({
            recipientPhone: recipientPhone,
            // caption: text,
            url: image,
          });

          await this.sendSimpleButtons({
            message: `Hey ${recipientName}, \nWe are please to invite you to.\n${eventName}`,
            recipientPhone: recipientPhone,
            listOfButtons: [
              {
                title: 'Confirm',
                id: `event-confirm_${invite?.eventId}_${invite?.invites?.id}`,
              },
              {
                title: 'Decline',
                id: `event-deline_${invite?.eventId}_${invite?.invites?.id}`,
              },
              {
                title: 'Event Location',
                id: `event-location_${invite?.eventId}_${invite?.invites?.id}`,
              },
            ],
          });

        }

        if (button_event[0] === 'other') {
          this.sendText({
            message: 'Welcome to Halla Electronic invitaions! We are here to assist you.To speek with our customer serviceteam, please click on the link below.',
            recipientPhone: recipientPhone,
          });

        }

      };

      setTimeout(() => {
        previousRecipientPhone = ''
      }, 2500);
    }

    return null;
  }



  public async sendInviteToGuest(body: any): Promise<any> {
    const { callingCode, phoneNumber, text, image, recipientName, eventName, eventId, contactId } = body;
    const recipientPhone = `${callingCode.replace('+', '')}${phoneNumber}`
    try {

      if (image) {
        await this.sendImage({
          recipientPhone: recipientPhone,
          // caption: text,
          url: image,
        });
      }

      const response = await this.sendSimpleButtons({
        message: text,
        recipientPhone: recipientPhone,
        listOfButtons: [
          {
            title: 'Confirm',
            id: `event-confirm_${eventId}_${contactId}`,
          },
          {
            title: 'Decline',
            id: `event-deline_${eventId}_${contactId}`,
          },
          {
            title: 'Event Location',
            id: `event-location_${eventId}_${contactId}`,
          },
        ],
      });
      console.log("🚀 ~ WhatsappService ~ sendInviteToGuest ~ response:", response)
      return response;
    } catch (error) {
      console.log("🚀 ~ WhatsappService ~ sendInviteToGuest ~ error:", error);
      return error;

    }


  }

  public async findEventOneById(
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
    const invite = await queryBuilder.where("event_invitess_contacts.eventId = :eventId", { eventId: eventId })
      .andWhere("event_invitess_contacts.contactsId = :contactsId", { contactsId: id })
      .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
      .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']).getOne();
    console.log("🚀 ~ WhatsappService ~ invite:", invite)
    return invite;
  }

  public async findInviteByContactId(id: number): Promise<EventInvitessContacts[]> {
    const queryBuilder = this.eventInvitessContacts.createQueryBuilder("event_invitess_contacts");
    const invite = await queryBuilder.where("event_invitess_contacts.contactsId = :contactsId", { contactsId: id })
      .leftJoinAndSelect('event_invitess_contacts.invites', 'invites').leftJoinAndSelect('event_invitess_contacts.events', 'events')
      .select(['event_invitess_contacts', 'events', 'invites.id', 'invites.name', 'invites.callingCode', 'invites.phoneNumber', 'invites.email']).getMany();
    return invite;
  }

  public async sendText({ message, recipientPhone }) {
    this._mustHaverecipientPhone(recipientPhone);
    this._mustHaveMessage(message);
    let body = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    };

    let response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }

  public async emitEvent(event: string, data: any): Promise<void> {
    const server = this.chatGateway.getServerInstance();
    if (server) {
      console.log("🚀 ~ WhatsappService ~ create ~ chat:", data)
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
    let validSections = listOfSections
      .map((section) => {
        let title = section.title;
        let rows = section.rows?.map((row) => {
          if (!row.id) {
            throw new Error(
              '"row.id" of an item is required in list of radio buttons.'
            );
          }
          if (row.id.length > 200) {
            throw new Error(
              'The row id must be between 1 and 200 characters long.'
            );
          }
          if (!row.title) {
            throw new Error(
              '"row.title" of an item is required in list of radio buttons.'
            );
          }
          if (row.title.length > 24) {
            throw new Error(
              'The row title must be between 1 and 24 characters long.'
            );
          }
          if (!row.description) {
            throw new Error(
              '"row.description" of an item is required in list of radio buttons.'
            );
          }
          if (row.description.length > 72) {
            throw new Error(
              'The row description must be between 1 and 72 characters long.'
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
            '"title" of a section is required in list of radio buttons.'
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
        'The total number of items in the rows must be equal or less than 10.'
      );
    }

    let samples = {
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

    let response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body: samples,
    });

    return response;
  }

  public async findByCombinedPhoneNumber(phoneNumber: string): Promise<Contacts> {
    const combinedPhoneNumber = `+${phoneNumber}`;

    return await this.contactsRepository
      .createQueryBuilder("contacts")
      .where("CONCAT(contacts.callingCode, contacts.phoneNumber) = :combinedPhoneNumber", { combinedPhoneNumber })
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
      let defaultHeaders = () => {
        let output = {
          'Content-Type': 'application/json',
          'Accept-Language': 'en_US',
          Accept: 'application/json',
        };
        if (this.accessToken) {
          output['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return output;
      };
      let defaultBody = {};
      let defaultMethod = 'GET';

      if (!url) {
        throw new Error('"url" is required in making a request');
      }

      if (!method) {
        signale.warn(
          `WARNING: "method" is missing. The default method will default to ${defaultMethod}. If this is not what you want, please specify the method.`
        );
      }

      if (!headers) {
        signale.warn(`WARNING: "headers" is missing.`);
      }

      if (method?.toUpperCase() === 'POST' && !body) {
        signale.warn(
          `WARNING: "body" is missing. The default body will default to ${JSON.stringify(
            defaultBody
          )}. If this is not what you want, please specify the body.`
        );
      }

      method = method?.toUpperCase() || defaultMethod;
      headers = {
        ...defaultHeaders(),
        ...headers,
      };
      body = body || defaultBody;
      this.baseUrl = baseUrl || this.baseUrl;
      let fullUrl = `${this.baseUrl}${url}`;

      unirest(method, fullUrl)
        .headers(headers)
        .send(JSON.stringify(body))
        .end(function (res) {
          if (res.error) {
            let errorObject = () => {
              try {
                return (
                  res.body?.error ||
                  JSON.parse(res.raw_body)
                );
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
  };


  async sendSimpleButtons({ recipientPhone, message, listOfButtons }) {
    this._mustHaveMessage(message);
    this._mustHaverecipientPhone(recipientPhone);

    if (!listOfButtons) throw new Error('listOfButtons cannot be empty');
    if (listOfButtons.length > 3) throw new Error('listOfButtons cannot be bigger than 3 elements');

    let validButtons = listOfButtons
      .map((button) => {
        if (!button.title) {
          throw new Error('"title" is required in making a request.');
        }
        if (button.title.length > 20) {
          throw new Error(
            'The button title must be between 1 and 20 characters long.'
          );
        }
        if (!button.id) {
          throw new Error('"id" is required in making a request.');
        }
        if (button.id.length > 256) {
          throw new Error(
            'The button id must be between 1 and 256 characters long.'
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

    let body = {
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

    let response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }

  async sendImage({ recipientPhone, caption = '', url }) {
    this._mustHaverecipientPhone(recipientPhone);

    let body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'image',
      image: {
        link: url,
        caption: caption || '',
      },
    };

    let response = await this._fetchAssistant({
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
        '"latitude" and "longitude" are required in making a request'
      );
    }

    if (!name || !address) {
      throw new Error(
        '"name" and "address" are required in making a request'
      );
    }

    let body = {
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

    let response = await this._fetchAssistant({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }


  private _mustHaverecipientPhone(recipientPhone) {
    if (!recipientPhone) {
      throw new Error(
        '"recipientPhone" is required in making a request'
      );
    }
  };
  private _mustHaveMessage(message) {
    if (!message) {
      throw new Error('"message" is required in making a request');
    }
  };

  private _mustHaveTemplateName(templateName) {
    if (!templateName) {
      throw new Error('"templateName" is required in making a request');
    }
  };
  private _mustHaveComponents(components) {
    if (!components) {
      throw new Error('"components" is required in making a request');
    }
  };
  private _mustHaveLanguageCode(languageCode) {
    if (!languageCode) {
      throw new Error('"languageCode" is required in making a request');
    }
  };
  private _mustHaveMessageId(messageId) {
    if (!messageId) {
      throw new Error('"messageId" is required in making a request');
    }
  };

  private parseMessage(requestBody: any) {
    return messageParser({ requestBody, currentWABA_ID: this.WABA_ID });
  }

}
