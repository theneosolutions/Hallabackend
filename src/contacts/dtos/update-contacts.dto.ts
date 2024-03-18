import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsNumberString, IsOptional, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { NAME_REGEX, SLUG_REGEX } from '../../common/consts/regex.const';
import { isNull, isUndefined } from '../../common/utils/validation.util';

export abstract class UpdateContactsDto {

    @ApiProperty({
        description: 'User id',
        example: 123,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    public user: number;

    @ApiProperty({
        description: 'Name',
        example: 'John',
        type: String,
    })
    @IsString()
    @Length(3, 100)
    @IsOptional()
    @Matches(NAME_REGEX, {
        message: 'Name must not have special characters',
    })
    public name?: string;

    @ApiProperty({
        description: 'suffix',
        example: 'John',
        type: String,
    })
    @IsString()
    @Length(1, 100)
    @IsOptional()
    public suffix?: string;

    @ApiProperty({
        description: 'The email of the user',
        example: 'someone@gmail.com',
        minLength: 5,
        maxLength: 255,
        type: String,
    })
    @IsString()
    @IsEmail()
    @IsOptional()
    @Length(5, 255)
    public email: string;

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
        description: 'status',
        example: 'active/disabled',
        type: String,
    })
    @IsString()
    @Length(3, 100)
    @IsOptional()
    public status?: string;
}