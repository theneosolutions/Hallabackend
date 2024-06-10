import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Contacts } from './entities/contacts.entity';
import { UpdateContactsDto } from './dtos/update-contacts.dto';
import { isInt } from 'class-validator';
import { ContactsDto } from './dtos/create-contacts';
import { UsersService } from 'src/users/users.service';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { IMessage } from 'src/common/interfaces/message.interface';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  public async create(
    origin: string | undefined,
    dto: ContactsDto,
  ): Promise<Contacts> {
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

  public async getOrCreateContacts(
    contacts: any[],
    userId: number,
  ): Promise<number[]> {
    const ContactsIds = await Promise.all(
      contacts.map(async (contact: any) => {
        const phone = await this.findOneByPhone(
          contact.callingCode,
          contact.phoneNumber,
        );
        if (phone && phone.id) {
          return {
            id: phone.id,
            ...contact,
          };
        } else {
          const newPhone = await this.createContact(contact, userId);
          return {
            id: newPhone.id,
            ...contact,
          };
        }
      }),
    );

    return ContactsIds;
  }

  public async findOneByPhone(
    callingCode: string,
    phoneNumber: string,
  ): Promise<Contacts> {
    return await this.contactsRepository.findOneBy({
      callingCode,
      phoneNumber,
    });
  }

  public async createContact(contact: any, userId: any): Promise<Contacts> {
    const { callingCode, phoneNumber, name = 'new' } = contact;

    if (isNaN(userId) || isNull(userId) || isUndefined(userId)) {
      throw new BadRequestException(['User cannot be null']);
    }

    const userDetail = await this.usersService.findOneById(userId);
    console.log(
      '🚀 ~ ContactsService ~ createContact ~ userDetail:',
      userDetail,
    );

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
      name: name,
      suffix: 'Mr',
      callingCode: callingCode,
      phoneNumber: formattedPhone,
      user: userId,
    });
    await this.contactsRepository.insert(constact);
    return constact;
  }

  public async findOneByWhere(where: any): Promise<Contacts[]> {
    const contactsItems = await this.contactsRepository.findBy(where);
    return contactsItems;
  }

  private async checkPhoneUniqueness(
    callingCode: string,
    phoneNumber: string,
  ): Promise<void> {
    const count = await this.contactsRepository.countBy({
      callingCode,
      phoneNumber,
    });

    if (count > 0) {
      throw new ConflictException(['Phone number already in use']);
    }
  }

  public async findContactById(id: string): Promise<any> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid contact id: ' + parsedValue);
    }

    const contactId: any = await this.contactsRepository
      .createQueryBuilder('contacts')
      .where('contacts.id = :id', { id: parsedValue })
      .leftJoinAndSelect('contacts.user', 'user')
      .select(['contacts', 'user.id', 'user.firstName', 'user.lastName'])
      .getOne();

    return contactId;
  }

  public async findOneById(id: number): Promise<Contacts> {
    const contactId = await this.contactsRepository.findOneBy({ id });
    console.log('🚀 ~ ContactsService ~ contactItem:', contactId);
    this.commonService.checkEntityExistence(contactId, 'contact');
    return contactId;
  }

  public async getContactsByUserId(
    id: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<ContactsDto>> {
    const queryBuilder = this.contactsRepository.createQueryBuilder('contacts');
    queryBuilder
      .where('contacts.userId = :id', { id: id })
      .leftJoinAndSelect('contacts.user', 'user')
      .select(['contacts', 'user.id', 'user.firstName', 'user.lastName'])
      .orderBy('contacts.createdAt', pageOptionsDto.order);

    if (pageOptionsDto.status !== '') {
      queryBuilder.andWhere('contacts.status like :status', {
        status: `%${pageOptionsDto.status}%`,
      });
    }
    if (pageOptionsDto.status == '') {
      queryBuilder.andWhere('contacts.status IN(:...keys)', {
        keys: ['active'],
      });
    }

    const itemCount = await queryBuilder.getCount();
    const { entities }: any = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(await Promise.all(entities), pageMetaDto);
  }

  public async update(
    contactId: string,
    dto: UpdateContactsDto,
  ): Promise<Contacts> {
    try {
      const parsedValue = parseInt(contactId, 10);

      if (isNaN(parsedValue) && !isInt(parsedValue)) {
        throw new BadRequestException('Invalid contact id: ' + parsedValue);
      }
      const contactData = await this.findOneById(parsedValue);
      // Update other fields
      Object.assign(contactData, dto);

      // Save the updated sectionData
      await this.contactsRepository.save(contactData);

      // Return the updated section data
      return contactData;
    } catch (error) {
      throw new BadRequestException([error?.message]);
    }
  }

  public async delete(id: string): Promise<IMessage> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid contact id: ' + parsedValue);
    }
    await this.contactsRepository.softDelete(parsedValue);
    return this.commonService.generateMessage('Contact deleted successfully!');
  }

  /**
   *
   * Get packageIds from transactions against userId 
   * Get total numberOfGuest from packages
   * Get total number of invitation sent against userId (event_invitess_contacts)
   * Compare total numberOfGuest from packages to total number of invitation sent
   * If invitation sent count exceeded reply with message Please buy package
   * @param userId
   * @returns true | false boolean
   */
  public async isUserAllowToAddContacts(userId: number): Promise<boolean> {
    // Get total numberOfGuest from packages bought by user
    const query = `
      SELECT
        SUM(p.numberOfGuest) as userInvitationCount
      FROM
        halla.transactions t
      LEFT JOIN
        halla.packages p
      ON
        p.id = t.packageId
      WHERE
        t.userId = ${userId}
    `;
    const packageNumberOfGuest: any = await this.dataSource.query(query);
    const totalNumberOfGuest = packageNumberOfGuest[0].userInvitationCount ?? 0;

    // Get total number of invitation sent count
    const queryUserSentInvitationCount = `
      SELECT
        SUM(numberOfGuests) as userSentInvitationCount
      FROM
        halla.event_invitess_contacts
      WHERE
        usersId = ${userId}
      `;

    const userInvitationSentCount: any = await this.dataSource.query(
      queryUserSentInvitationCount,
    );
    const totalNumberOfInvitationSentCount =
      userInvitationSentCount[0].userSentInvitationCount ?? 0;

    return totalNumberOfGuest >= totalNumberOfInvitationSentCount;
  }

}
