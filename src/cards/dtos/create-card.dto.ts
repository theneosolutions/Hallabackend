import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';

export abstract class CardDto {

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


}