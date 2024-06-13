import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export abstract class GetQRCodeParams {
  @ApiProperty({
    description: 'contactId of the event invite',
    type: String,
    example: '1',
  })
  @IsString()
  @Length(1, 106)
  public contactId: string;

  @ApiProperty({
    description: 'eventId of an event',
    type: String,
    example: '1',
  })
  @IsString()
  @Length(1, 106)
  public eventId: string;
}
