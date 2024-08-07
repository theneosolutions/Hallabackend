import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentDto } from './notification-content.dto';

export class PushNotificationDto {
  @ApiProperty({
    description: 'Array of user IDs to send notifications to',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  public userIds: number[];

  @ApiProperty({
    description: 'Notification content',
    type: ContentDto,
  })
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ContentDto)
  public content: ContentDto;
}
