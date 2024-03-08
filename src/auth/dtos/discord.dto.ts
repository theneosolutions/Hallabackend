import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';
import { PasswordsDto } from './passwords.dto';

export abstract class DiscordDto {
    @ApiProperty({
        description: 'code',
        example: 'On7PIIcoTrOCysQJ66GhfOxWLJhfCW',
        type: String,
    })
    @IsString()
    public code!: string;
}