import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';
import { PasswordsDto } from './passwords.dto';

export abstract class SignUpDto extends PasswordsDto {
  @ApiProperty({
    description: 'The user firstName',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 100, {
    message: 'firstName has to be between 3 and 100 characters.',
  })
  @Matches(NAME_REGEX, {
    message: 'firstName can only contain letters, dtos, numbers and spaces.',
  })
  public firstName!: string;

  @ApiProperty({
    description: 'The user lastName',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 100, {
    message: 'lastName has to be between 3 and 100 characters.',
  })
  @Matches(NAME_REGEX, {
    message: 'lastName can only contain letters, dtos, numbers and spaces.',
  })
  public lastName!: string;

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
  public email!: string;

  @ApiProperty({
    description: 'user referredBy',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @IsOptional()
  @Length(4, 12, {
    message: 'Reference code of 5 characters',
  })
  public referredBy?: string;
}