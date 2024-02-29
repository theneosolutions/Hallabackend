
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
const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');


@Injectable()
export class WhatsappService {
  private readonly Whatsapp = new WhatsappCloudAPI({
    accessToken: process.env.Meta_WA_accessToken,
    senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
    WABA_ID: process.env.Meta_WA_wabaId,
    graphAPIVersion: 'v14.0'
  });

  constructor(
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) { }

  public async create(origin: string | undefined, body: any): Promise<any> {
    let data = this.Whatsapp.parseMessage(body);

    if (data?.isMessage) {
      let incomingMessage = data.message;
      let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
      let recipientName = incomingMessage.from.name;
      let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
      let message_id = incomingMessage.message_id; // extract the message id

      if (typeOfMsg === 'text_message') {
        await this.Whatsapp.sendSimpleButtons({
          message: `Hey ${recipientName}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`,
          recipientPhone: recipientPhone,
          listOfButtons: [
            {
              title: 'View some products',
              id: 'see_categories',
            },
            {
              title: 'Speak to a human',
              id: 'speak_to_human',
            },
          ],
        });
      }
      if (typeOfMsg === 'simple_button_message') {
        let button_id = incomingMessage.button_reply.id;

        if (button_id === 'speak_to_human') {
          await this.Whatsapp.sendText({
            recipientPhone: recipientPhone,
            message: `Arguably, chatbots are faster than humans.\nCall my human with the below details:`,
          });

          await this.Whatsapp.sendContact({
            recipientPhone: recipientPhone,
            contact_profile: {
              addresses: [
                {
                  city: 'Nairobi',
                  country: 'Kenya',
                },
              ],
              name: {
                first_name: 'Daggie',
                last_name: 'Blanqx',
              },
              org: {
                company: 'Mom-N-Pop Shop',
              },
              phones: [
                {
                  phone: '+1 (555) 025-3483',
                },
                {
                  phone: '+254712345678',
                },
              ],
            },
          });
        }
      };
    }
    return null;
  }



}
