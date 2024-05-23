import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../../users/interfaces/user.interface';
import { IAuthResponseUser } from '../interfaces/auth-response-user.interface';

export class AuthResponseUserMapper implements IAuthResponseUser {
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
    description: 'The user OTP',
    example: 1234,
    type: Number,
  })
  public otp: number;

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

  constructor(values: IAuthResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: IUser): AuthResponseUserMapper {
    return new AuthResponseUserMapper({
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
      otp: user.otp,
      confirmed: user.confirmed,
      isBanned: user.isBanned,
      wallet: user?.wallet,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}
