import { ApiProperty } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { NAME_REGEX, SLUG_REGEX } from '../../common/consts/regex.const';
import { isNull, isUndefined } from '../../common/utils/validation.util';

export abstract class UpdateUserDto {
  @ApiProperty({
    description: 'The new username',
    example: 'new-username',
    type: String,
  })
  @IsString()
  @Length(3, 106)
  @IsOptional()
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  @ValidateIf((o: UpdateUserDto) => !isUndefined(o.username))
  public username?: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @IsOptional()
  @Matches(NAME_REGEX, {
    message: 'First name must not have special characters',
  })
  public firstName?: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @IsOptional()
  @Matches(NAME_REGEX, {
    message: 'Last name must not have special characters',
  })
  public lastName?: string;

  @ApiProperty({
    description: 'Ban/unban user',
    example: 'isBanned: false',
    type: Boolean,
  })
  @IsOptional()
  public isBanned?: boolean;

  @ApiProperty({
    description: 'confirm user',
    example: 'confirmed: false',
    type: Boolean,
  })
  @IsOptional()
  public confirmed?: boolean;

  @ApiProperty({
    description: 'status',
    example: 'active/disabled',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @IsOptional()
  public status?: string;

  @ApiProperty({
    description: 'profile image',
    example: 'https://res.cloudinary.com/dogufahvv/image/upload/default.jpg',
    type: String,
  })
  @IsString()
  @IsOptional()
  public profilePhoto: string;

  @ApiProperty({
    description: 'Country calling code',
    example: '+92',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @IsOptional()
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
  @IsOptional()
  @Length(3, 100, {
    message: 'phone number has to be between 5 and 100 characters.',
  })
  public phoneNumber!: string;

  @ApiProperty({
    description: 'address',
    example: 'Address of the place',
    type: String,
  })
  @IsString()
  @IsOptional()
  public address: string;

  @ApiProperty({
    description: 'latitude',
    example: 10.287896,
    type: Number,
  })
  @IsLatitude()
  @IsOptional()
  public latitude: number;

  @ApiProperty({
    description: 'latitude',
    example: 16.424534,
    type: Number,
  })
  @IsLongitude()
  @IsOptional()
  public longitude: number;
}
