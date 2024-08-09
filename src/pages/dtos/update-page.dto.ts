import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { PageType } from './create-page';

export class UpdatePageDto {
  @ApiProperty({
    description: 'Type of the page',
    example: 'terms_and_conditions',
    type: String,
  })
  @IsOptional()
  @IsEnum(PageType)
  public type?: PageType;

  @ApiProperty({
    description: 'Title of the page',
    example: 'Terms and Conditions',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public title?: string;

  @ApiProperty({
    description: 'HTML content of the page',
    example: '<p>This is the content of the page.</p>',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public content?: string;
}
