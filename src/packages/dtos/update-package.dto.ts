import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { NAME_REGEX, SLUG_REGEX } from '../../common/consts/regex.const';
import { isNull, isUndefined } from '../../common/utils/validation.util';

export abstract class UpdatePackageDto {
    @ApiProperty({
        description: 'New package name',
        example: 'Premium 🤩',
        type: String,
    })
    @IsString()
    @IsOptional()
    @Length(3, 106)
    @ValidateIf(
        (o: UpdatePackageDto) =>
            !isUndefined(o.name) || isNull(o.name),
    )
    public name?: string;

    @ApiProperty({
        description: 'New sub heading package',
        example: 'Most Recommended',
        type: String,
    })
    @IsOptional()
    @IsString()
    @Length(3, 106)
    @ValidateIf(
        (o: UpdatePackageDto) =>
            !isUndefined(o.subHeading) || isNull(o.subHeading),
    )
    public subHeading?: string;

    @ApiProperty({
        description: 'New package price',
        example: 80,
        type: String,
    })
    @IsOptional()
    @IsNumber()
    @ValidateIf(
        (o: UpdatePackageDto) =>
            !isUndefined(o.price) || isNull(o.price),
    )
    public price?: number;


    @ApiProperty({
        description: 'Number of Guests',
        example: 10,
        type: String,
    })
    @IsOptional()
    @IsNumber()
    @ValidateIf(
        (o: UpdatePackageDto) =>
            !isUndefined(o.numberOfGuest) || isNull(o.numberOfGuest),
    )
    public numberOfGuest?: number;


    @ApiProperty({
        description: 'New package status',
        example: 'active',
        type: String,
    })
    @IsOptional()
    @IsString()
    @Length(3, 106)
    @ValidateIf(
        (o: UpdatePackageDto) =>
            !isUndefined(o.status) || isNull(o.status),
    )
    public status?: string;

    @ApiProperty({
        description: 'New package notes',
        example: '',
        type: String,
    })
    @IsOptional()
    @IsString()
    @Length(0, 106)
    @ValidateIf(
        (o: UpdatePackageDto) =>
            !isUndefined(o.notes) || isNull(o.notes),
    )
    public notes?: string;

    @ApiProperty({
        description: 'New package description',
        example: 'Package description',
        type: String,
    })
    @IsOptional()
    @IsString()
    @Length(0, 5000)
    @ValidateIf(
        (o: UpdatePackageDto) =>
            !isUndefined(o.description) || isNull(o.description),
    )
    public description?: string;
}