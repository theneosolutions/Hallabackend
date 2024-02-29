import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsBoolean, IsDateString, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString} from 'class-validator';

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
    example: [
      '+923012345678',
      '+962245234234',
    ]
  })
  @ArrayMinSize(1)
  @IsOptional()
  // @IsNumber()
  public contacts?: String[];


  @ApiProperty({
    description: 'Event Name',
    example: 'Restaurant opening invitation',
    type: String,
  })
  @IsString()
  public name: string;

  @ApiProperty({
    description: 'Event Image',
    example: 'https://www.shutterstock.com/shutterstock/photos/1883117047/display_1500/stock-vector-vector-grand-opening-invitation-or-flyer-design-with-event-details-for-restaurant-1883117047.jpg',
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
  public eventDate: String;

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

}