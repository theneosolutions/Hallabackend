import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';

export abstract class ContactsDto {
  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  public user: number;

  @ApiProperty({
    description: 'The user name',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 100, {
    message: 'name has to be between 3 and 100 characters.',
  })
  @Matches(NAME_REGEX, {
    message: 'name can only contain letters, dtos, numbers and spaces.',
  })
  public name!: string;

  @ApiProperty({
    description: 'The user suffix',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 100, {
    message: 'suffix has to be between 3 and 100 characters.',
  })
  @Matches(NAME_REGEX, {
    message: 'suffix can only contain letters, dtos, numbers and spaces.',
  })
  public suffix!: string;

  @ApiProperty({
    description: 'The user email',
    example: 'example@gmail.com',
    minLength: 5,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsEmail()
  @Length(5, 255)
  @IsOptional()
  public email!: string;

  @ApiProperty({
    description: 'Country calling code',
    example: '+92',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 5, {
    message: 'calling code has to be between 3 and 5 characters.',
  })
  public callingCode!: string;

  @ApiProperty({
    description: 'The user phone number without country code',
    example: '123456789',
    minLength: 5,
    maxLength: 100,
    type: Number,
  })
  @IsNumberString()
  @Length(3, 100, {
    message: 'phone number has to be between 5 and 100 characters.',
  })
  public phoneNumber!: string;
}
