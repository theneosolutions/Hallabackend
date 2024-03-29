import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import { PhoneDto } from './../dtos/phone.dto';

export abstract class EventGuestsDto {
  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  public user: number;

  @ApiProperty({
    type: String,
    example: [{
      callingCode:'+92',
      phoneNumber:'3012345678',
      name:'Jhon',
      guestcount:1
    }]
  })
  @ArrayMinSize(1)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  public contacts?: PhoneDto[];


}