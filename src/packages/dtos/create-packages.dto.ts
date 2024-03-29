import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export abstract class PackagesDto {
  @ApiProperty({
    description: 'Package Name',
    example: 'Premium 🤩',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 220)
  @IsOptional()
  public name: string;

  @ApiProperty({
    description: 'Package sub heading',
    example: 'Most Recommended',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 230)
  @IsOptional()
  public subHeading: string;

  @ApiProperty({
    description: 'Package price',
    example:80,
    minLength: 3,
    maxLength: 100,
    type: Number,
  })
  @IsNumber()
  public price: number;

  @ApiProperty({
    description: 'Number of guest',
    example:10,
    type: Number,
  })
  @IsNumber()
  public numberOfGuest: number;

  @ApiProperty({
    description: 'Extra notes (optional)',
    minLength: 3,
    maxLength: 100,
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  public notes: string;

  @ApiProperty({
    description: 'Package full description',
    minLength: 3,
    maxLength: 5000,
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  public description: string;

}