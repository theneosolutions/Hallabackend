import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';


export abstract class ContentDto {

    @ApiProperty({
        description: 'Notification Title',
        example: 'test notification',
        type: String,
    })
    @IsString()
    public message?: string;


    @ApiProperty({
        description: 'Notification body',
        example: 'test notification body',
        type: String,
    })
    @IsString()
    public body: string;


}