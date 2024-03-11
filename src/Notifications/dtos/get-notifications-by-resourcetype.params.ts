import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export abstract class GetNotificationByResourceTypeParams {
    @ApiProperty({
        description: 'The type of the resource',
        type: String,
        example: "post",
    })
    @IsString()
    @Length(1, 106)
    public type: string;
}