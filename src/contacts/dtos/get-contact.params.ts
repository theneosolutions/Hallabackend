import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export abstract class GetContactParams {
  @ApiProperty({
    description: 'The id of the contact',
    type: String,
    example: '1',
  })
  @IsString()
  @Length(1, 106)
  public id: string;
}
