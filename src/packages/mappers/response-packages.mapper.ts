import { ApiProperty } from '@nestjs/swagger';
import { IResponsePackages } from '../interfaces/response-packages.interface';
import { IPackages } from '../interfaces/packages.interface';

export class ResponsePackagesMapper implements IResponsePackages {
  @ApiProperty({
    description: 'Package id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'Package Name',
    example: 'Premium 🤩',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Package sub heading',
    example: 'Most Recommended',
    type: String,
  })
  public subHeading: string;

  @ApiProperty({
    description: 'Package price',
    example: 222,
    type: Number,
  })
  public price: number;

  @ApiProperty({
    description: 'Number of Guests',
    example: 10,
    type: String,
  })
  public numberOfGuest?: number;

  @ApiProperty({
    description: 'Extra notes (optional)',
    example: '',
    required: false,
    type: String,
  })
  public notes: string;


  @ApiProperty({
    description: 'Package full description',
    example: '',
    required: false,
    type: String,
  })
  public description: string;

  @ApiProperty({
    description: 'Package current status',
    example: 'active',
    required: false,
    type: String,
  })
  public status: string;


  @ApiProperty({
    description: 'User creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: Date,
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: Date,
  })
  public updatedAt: Date;

  constructor(values: IResponsePackages) {
    Object.assign(this, values);
  }

  public static map(packageObj: IPackages): ResponsePackagesMapper {
    return new ResponsePackagesMapper({
      id: packageObj?.id,
      name: packageObj?.name,
      subHeading: packageObj?.subHeading,
      price: packageObj?.price,
      status: packageObj?.status,
      notes: packageObj?.notes,
      description: packageObj?.description,
      numberOfGuest: packageObj?.numberOfGuest,
      createdAt: packageObj?.createdAt,
      updatedAt: packageObj?.updatedAt,
    });
  }
}