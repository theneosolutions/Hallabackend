import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';
import { ContentDto } from '../dtos/notification-content.dto';

export abstract class NotificationDto {
  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  public user: number;

  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  public sendNotificationTo!: number;

  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  public parent!: number;

  @ApiProperty({
    description: 'resource id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  public resourceId: number;

  @ApiProperty({
    description: 'resource type',
    example: 'subscription',
    type: String,
  })
  @IsString()
  public resourceType: string;

  @ApiProperty({
    description: 'resource type',
    example: 'subscription',
    type: String,
  })
  @IsString()
  public parentType: string;

  @ApiProperty({
    description: 'notification content',
    // example: 'You have a new meeting request with LINKEDIN',
    type: ContentDto,
  })
  @IsObject()
  public content: ContentDto;
}
