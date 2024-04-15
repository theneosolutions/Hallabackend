import { ApiProperty } from '@nestjs/swagger';
import { IResponseUser } from '../interfaces/response-user.interface';
import { IUser } from '../interfaces/user.interface';
export class ResponseUserMapper implements IResponseUser {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'User firstName',
    example: 'John',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public firstName: string;

  @ApiProperty({
    description: 'User lastName',
    example: 'Doe',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public lastName: string;

  @ApiProperty({
    description: 'User username',
    example: 'john.doe1',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  public username: string;

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
    description: 'The user login type',
    example: 'manual_login',
    type: String,
  })
  public loginType: string;

  @ApiProperty({
    description: 'The user profile photo',
    example: 'https://res.cloudinary.com/dogufahvv/image/upload/default.jpg',
    type: String,
  })
  public profilePhoto: string;

  @ApiProperty({
    description: 'The user reference code',
    example: '1234',
    type: String,
  })
  public referenceCode: string;

  @ApiProperty({
    description: 'The user role',
    example: 'user',
    type: String,
  })
  public roles: string;

  @ApiProperty({
    description: 'The user email confirmed',
    example: true,
    type: Boolean,
  })
  public confirmed: boolean;

  @ApiProperty({
    description: 'The user banned status',
    example: false,
    type: Boolean,
  })
  public isBanned: boolean;

  @ApiProperty({
    description: 'Country calling code',
    example: '+92',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  public callingCode!: string;

  @ApiProperty({
    description: 'The user phone number without country code',
    example: '123456789',
    minLength: 5,
    maxLength: 100,
    type: Number,
  })
  public phoneNumber!: string;

  @ApiProperty({
    description: 'address',
    example: 'Address of the place',
    type: String,
  })
  public address: string;

  @ApiProperty({
    description: 'latitude',
    example: 10.287896,
    type: Number,
  })
  public latitude: number;

  @ApiProperty({
    description: 'latitude',
    example: 16.424534,
    type: Number,
  })
  public longitude: number;

  @ApiProperty({
    description: 'wallet',
    example: 100,
    type: Number,
  })
  public wallet: number;

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

  constructor(values: IResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: IUser): ResponseUserMapper {
    return new ResponseUserMapper({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      status: user.status,
      loginType: user.loginType,
      profilePhoto: user.profilePhoto,
      referenceCode: user.referenceCode,
      roles: user.roles,
      confirmed: user.confirmed,
      isBanned: user.isBanned,
      callingCode: user.callingCode,
      phoneNumber: user.phoneNumber,
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      wallet:user?.wallet,
      otp:user?.otp,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}