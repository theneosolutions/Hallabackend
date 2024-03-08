import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsNumberString } from 'class-validator';

export abstract class PhoneDto {
  @ApiProperty({
    description: 'Country calling code',
    example:'+92',
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
    example:'123456789',
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