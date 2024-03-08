import { ApiProperty } from '@nestjs/swagger';
import { IResponseContacts } from '../interfaces/response-contacts.interface';
import { IContacts } from '../interfaces/contacts.interface';

export class ResponseContactsMapper implements IResponseContacts {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  public user: number;

  @ApiProperty({
    description: 'User name',
    example: 'John',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'User suffix',
    example: 'Doe',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public suffix: string;

  @ApiProperty({
    description: 'Country calling code',
    example:'+92',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  public callingCode!: string;

  @ApiProperty({
    description: 'The user phone number without country code',
    example:'123456789',
    minLength: 5,
    maxLength: 100,
    type: Number,
  })
  public phoneNumber!: string;

  @ApiProperty({
    description: 'The user email',
    example: 'example@gmail.com',
    type: String,
  })
  public email: string;

  @ApiProperty({
    description: 'The user status',
    example: 'active',
    type: String,
  })
  public status: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public createdAt: string;

  @ApiProperty({
    description: 'User last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public updatedAt: string;

  constructor(values: IResponseContacts) {
    Object.assign(this, values);
  }

  public static map(contact: IContacts): ResponseContactsMapper {
    return new ResponseContactsMapper({
      id: contact.id,
      user: contact.user,
      name: contact.name,
      suffix: contact.suffix,
      email: contact.email,
      status: contact.status,
      callingCode: contact.callingCode,
      phoneNumber: contact.phoneNumber,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    });
  }
}