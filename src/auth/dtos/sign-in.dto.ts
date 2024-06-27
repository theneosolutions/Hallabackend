import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export abstract class SignInDto {
  @ApiProperty({
    description: 'Username or email',
    examples: ['john.doe', 'john.doe@gmail.com'],
    minLength: 5,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @Length(5, 255)
  public emailOrUsername: string;

  @ApiProperty({
    description: "User's password",
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(1)
  public password: string;

  @ApiProperty({
    description: "User's role",
    type: String,
  })
  @IsString()
  public role?: string = 'user';
}
