import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
