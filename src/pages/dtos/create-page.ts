import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum PageType {
  // maybe in future we would need more types for the page
  TERMS_AND_CONDITIONS = 'terms-and-conditions',
  FAQ = 'faq',
  REVIEW = 'review',
}

export class CreatePageDto {
  @ApiProperty({
    description: 'Type of the page',
    example: PageType.TERMS_AND_CONDITIONS,
    enum: PageType,
  })
  @IsNotEmpty()
  @IsEnum(PageType)
  public type: PageType;

  @ApiProperty({
    description: 'Title of the page',
    example: 'Terms and Conditions',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  public title: string;

  @ApiProperty({
    description: 'HTML content of the page',
    example: '<p>This is the content of the page.</p>',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  public content: string;
}
