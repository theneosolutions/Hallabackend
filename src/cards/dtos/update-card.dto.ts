//@ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

export abstract class UpdateCardDto {
  @ApiProperty({
    description: 'Card Name',
    example: 'Birthday invitation',
    type: String,
  })
  @IsString()
  public name: string;

  @ApiProperty({
    description: 'Birthday Type',
    example: 'Birthday',
    type: String,
  })
  @IsOptional()
  @IsString()
  public type: string;

  @ApiProperty({
    description: 'status',
    example: 'active',
    type: String,
  })
  @IsString()
  public status: string;

  @ApiProperty({
    description: 'notes',
    example: 'just some random notes related to this section',
    type: String,
  })
  @IsString()
  @IsOptional()
  public notes: string;

  @ApiProperty({
    description: 'file',
    example: 'html of the card design',
    type: String,
  })
  @IsOptional()
  @IsString()
  public file: string;

  @ApiProperty({
    description: 'image link',
    example:
      'https://stargatepublicresources.s3.amazonaws.com/public-resources/WhatsApp+Image+2023-07-20+at+5.15.10+PM.jpeg',
    type: String,
  })
  @IsOptional()
  @IsString()
  public image: string;
}
