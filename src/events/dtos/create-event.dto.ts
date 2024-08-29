import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsBoolean,
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export abstract class EventDto {
  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  public user: number;

  @ApiProperty({
    type: String,
    example: ['+923012345678', '+962245234234'],
  })
  @ArrayMinSize(1)
  @IsOptional()
  public contacts?: string[];

  @ApiProperty({
    description: 'Event Name',
    example: 'Restaurant opening invitation',
    type: String,
  })
  @IsString()
  public name: string;

  @ApiProperty({
    description: 'Event Image',
    example:
      'https://hallabucket007.s3.amazonaws.com/events/ceb705e6-21a8-5f3d-bdc0-d67a6aa0e123/89e8a91c-74e3-4799-85da-d3bd2a8e1025.jpeg',
    type: String,
  })
  @IsOptional()
  @IsString()
  public image: string;

  @ApiProperty({
    description: 'Event date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  @IsDateString()
  public eventDate: string;

  @ApiProperty({
    description: 'Show QR code',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  public showQRCode: boolean;

  @ApiProperty({
    description: 'status',
    example: 'active',
    type: String,
  })
  @IsString()
  public status: string;

  @ApiProperty({
    description: 'notes',
    example: 'just some random notes related to this event',
    type: String,
  })
  @IsOptional()
  @IsString()
  public notes: string;

  @ApiProperty({
    description: 'nearby place',
    example: 'name of the nearby place',
    type: String,
  })
  @IsOptional()
  @IsString()
  public nearby: string;

  @ApiProperty({
    description: 'address',
    example: 'Address of the place',
    type: String,
  })
  @IsString()
  public address: string;

  @ApiProperty({
    description: 'latitude',
    example: 10.287896,
    type: Number,
  })
  @IsLatitude()
  public latitude: number;

  @ApiProperty({
    description: 'latitude',
    example: 16.424534,
    type: Number,
  })
  @IsLongitude()
  public longitude: number;

  @ApiProperty({
    description: 'Event Description',
    example: 'Event description data',
    type: String,
  })
  @IsString()
  public description: string;

  @ApiProperty({
    description: 'EventsNumberOfGuests',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  public eventNumberOfGuests: number;

  @ApiProperty({
    description: 'EventsNumberOfScans',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  public eventNumberOfScans: number;
}
