
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


@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) { }

  public async create(origin: string | undefined, dto: ContactsDto): Promise<Contacts> {
    const { user: userId, name, suffix, email, callingCode, phoneNumber } = dto;

    if (isNaN(userId) || isNull(userId) || isUndefined(userId)) {
      throw new BadRequestException(['User cannot be null']);
    }

    const userDetail = await this.usersService.findOneById(userId);

    if (isNull(userDetail) || isUndefined(userDetail)) {
      throw new BadRequestException(['User not found with id: ' + userId]);
    }

    if (isNull(callingCode) || isUndefined(callingCode)) {
      throw new BadRequestException(['calling Code cannot be null']);
    }

    if (isNull(phoneNumber) || isUndefined(phoneNumber)) {
      throw new BadRequestException(['phone number cannot be null']);
    }

    if (isNull(name) || isUndefined(name)) {
      throw new BadRequestException(['name cannot be null']);
    }

    const formattedPhone = phoneNumber.toLowerCase();
    await this.checkPhoneUniqueness(callingCode, formattedPhone);

    const formattedEmail = email.toLowerCase();
    const formattedName = this.commonService.formatName(name);

    const constact = this.contactsRepository.create({
      email: formattedEmail,
      name: formattedName,
      suffix: suffix,
      callingCode: callingCode,
      phoneNumber: formattedPhone,
      user: userId,
    });
    await this.contactsRepository.insert(constact);
    return constact;
  }

  public async getOrCreateContacts(contacts: any[], userId: number): Promise<number[]> {
    const ContactsIds = await Promise.all(contacts.map(async (contact: any) => {
      const phone = await this.findOneByPhone(contact.callingCode, contact.phoneNumber);
      if (phone && phone.id) {
        return phone.id;
      } else {
        const newPhone = await this.createContact(contact, userId);
        return newPhone.id;
      }
    }));

    return ContactsIds;
  }

  public async findOneByPhone(
    callingCode: string,
    phoneNumber: string
  ): Promise<Contacts> {
    return await this.contactsRepository.findOneBy({ callingCode, phoneNumber });
  }

  public async createContact(contact: any, userId: any): Promise<Contacts> {
    const { callingCode, phoneNumber } = contact;

    if (isNaN(userId) || isNull(userId) || isUndefined(userId)) {
      throw new BadRequestException(['User cannot be null']);
    }

    const userDetail = await this.usersService.findOneById(userId);
    console.log("🚀 ~ ContactsService ~ createContact ~ userDetail:", userDetail)

    if (isNull(userDetail) || isUndefined(userDetail)) {
      throw new BadRequestException(['User not found with id: ' + userId]);
    }

    if (isNull(callingCode) || isUndefined(callingCode)) {
      throw new BadRequestException(['calling Code cannot be null']);
    }

    if (isNull(phoneNumber) || isUndefined(phoneNumber)) {
      throw new BadRequestException(['phone number cannot be null']);
    }

    const formattedPhone = phoneNumber.toLowerCase();

    const constact = this.contactsRepository.create({
      email: null,
      name: 'new',
      suffix: 'Mr',
      callingCode: callingCode,
      phoneNumber: formattedPhone,
      user: userId,
    });
    await this.contactsRepository.insert(constact);
    return constact;
  }

  public async findOneByWhere(
    where: any,
  ): Promise<Contacts[]> {
    const contactsItems = await this.contactsRepository.findBy(where)
    return contactsItems;
  }

  private async checkPhoneUniqueness(callingCode: string, phoneNumber: string): Promise<void> {
    const count = await this.contactsRepository.countBy({ callingCode, phoneNumber });

    if (count > 0) {
      throw new ConflictException(['Phone number already in use']);
    }
  }
}
