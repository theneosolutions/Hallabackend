import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export abstract class DiscordDto {
  @ApiProperty({
    description: 'code',
    example: 'On7PIIcoTrOCysQJ66GhfOxWLJhfCW',
    type: String,
  })
  @IsString()
  public code!: string;
}
