import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, ValidateIf } from 'class-validator';
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
    @Matches(SLUG_REGEX, {
        message: 'Username must be a valid slugs',
    })
    @ValidateIf(
        (o: UpdateUserDto) =>
            !isUndefined(o.username),
    )
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
        description: 'Discord user',
        example: 'JohnDoe1122',
        type: String,
    })
    @IsString()
    @IsOptional()
    public companyName?: string;

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
}