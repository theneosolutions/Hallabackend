import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsString, Length } from 'class-validator';
import { PasswordsDto } from './passwords.dto';

export abstract class ResetPasswordWithPhoneDto extends PasswordsDto {
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

  @ApiProperty({
    description: 'The OTP code sent to the user phone number',
    example: 1234,
    minLength: 4,
    maxLength: 4,
    type: Number,
  })
  @IsNumber()
  public otp!: number;
}
