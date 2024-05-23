import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum OtherOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class OtherPageOptionsDto {
  @ApiPropertyOptional({
    default: 1,
    description: 'Page number',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    default: 10,
    description: 'Number of items per page',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly take?: number = 10;

  @ApiPropertyOptional({
    enum: OtherOrder,
    default: OtherOrder.ASC,
    description: 'Sort order for "other" sections',
  })
  @IsEnum(OtherOrder)
  @IsOptional()
  readonly order?: OtherOrder = OtherOrder.ASC;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
