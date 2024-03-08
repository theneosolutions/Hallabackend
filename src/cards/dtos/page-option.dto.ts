import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, Max, Min, ValidateNested } from "class-validator";
import { OtherPageOptionsDto } from "./page-option-other-sections.dto";

export enum Order {
    ASC = "ASC",
    DESC = "DESC",
}

export class PageOptionsDto {
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

    @ApiPropertyOptional({
        default: '',
    })
    @Type(() => String)
    @IsOptional()
    @Transform((param) => param.value.toLowerCase())
    readonly type?: string = '';


    @ApiPropertyOptional({
        default: '',
    })
    @Type(() => String)
    @IsOptional()
    @Transform((param) => param.value.toLowerCase())
    readonly status?: string = '';

    //implementing extended search filters 04102023
    @ApiPropertyOptional({
        default: '',
    })
    @Type(() => String)
    @IsOptional()
    @Transform((param) => param.value.toLowerCase())
    readonly id?: string = '';

    @ApiPropertyOptional({
        default: '',
    })
    @Type(() => String)
    @IsOptional()
    @Transform((param) => param.value.toLowerCase())
    readonly name?: string = '';

    @ApiPropertyOptional({
        default: '',
    })
    @Type(() => String)
    @IsOptional()
    @Transform((param) => param.value.toLowerCase())
    readonly createdAt?: string = '';
}