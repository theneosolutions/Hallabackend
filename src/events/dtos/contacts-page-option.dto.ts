import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum StatusType {
  PENDING = 'pending',
  INVITED = 'invited',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  FAILED = 'failed',
  SCANNED = 'scanned',
  ALL = 'all',
  NOTINVITED = 'notinvited',
}

export class ContactsPageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  @ApiPropertyOptional({
    default: '',
  })
  @Type(() => String)
  @IsOptional()
  @Transform((param) => param.value.toLowerCase())
  readonly search?: string = '';

  @ApiPropertyOptional({ enum: StatusType, default: StatusType.ALL })
  @IsEnum(StatusType)
  @IsOptional()
  @Transform((param) => param.value.toLowerCase())
  readonly status?: StatusType = StatusType.ALL;
}
