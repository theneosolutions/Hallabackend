import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export abstract class GetInviteCodeParams {
  @ApiProperty({
    description: 'The id of the event invite',
    type: String,
    example: '1d48edfc-f53f-415e-97d3-92d4320df065',
  })
  @IsString()
  @Length(1, 106)
  public code: string;
}
