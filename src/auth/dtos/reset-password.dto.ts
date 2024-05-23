import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsJWT, IsNumber, IsString, Length } from 'class-validator';
import { PasswordsDto } from './passwords.dto';

export abstract class ResetPasswordDto extends PasswordsDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'someone@gmail.com',
    minLength: 5,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;

  @ApiProperty({
    description: 'The User OTP code',
    example: 1234,
    minLength: 4,
    maxLength: 4,
    type: Number,
  })
  @IsNumber()
  public otp!: number;
}
