import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PhoneDto } from 'src/auth/dtos/phone.dto';

export abstract class UpdateEventDto {

    @ApiProperty({
        description: 'User id',
        example: 123,
        type: Number,
    })
    @IsNumber()
    @IsOptional()
    public user: number;

    @ApiProperty({
        type: String,
        example: [{
          callingCode:'+92',
          phoneNumber:'3012345678',
        }]
      })
      @ArrayMinSize(1)
      @IsOptional()
      @IsArray()
      @ValidateNested({ each: true })
      @Type(() => PhoneDto)
      public contacts?: PhoneDto[];


    @ApiProperty({
        description: 'Event Name',
        example: 'Restaurant opening invitation',
        type: String,
    })
    @IsString()
    @IsOptional()
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
    @IsOptional()
    public eventDate: string;

    @ApiProperty({
        description: 'Show QR code',
        example: true,
        type: Boolean,
    })
    @IsBoolean()
    @IsOptional()
    public showQRCode: boolean;

    @ApiProperty({
        description: 'status',
        example: 'active',
        type: String,
    })
    @IsString()
    @IsOptional()
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
      @IsOptional()
      public address: string;

    @ApiProperty({
        description: 'latitude',
        example: 10.287896,
        type: Number,
    })
    @IsLatitude()
    @IsOptional()
    public latitude: number;

    @ApiProperty({
        description: 'latitude',
        example: 16.424534,
        type: Number,
    })
    @IsLongitude()
    @IsOptional()
    public longitude: number;

}