import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export abstract class TransactionDto {
  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  public user: number;

  @ApiProperty({
    description: 'Package id',
    example: 123,
    type: Number,
  })
  @IsNumber()
  public package: number;

  @ApiProperty({
    description: 'Transaction amount',
    type: String,
  })
  @IsString()
  public amount!: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'buy package',
    minLength: 3,
    maxLength: 200,
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    description: 'Payment id',
    example: 'd18499f2-ea2a-4342-8b69-7d8ebfebe749',
    type: String,
  })
  @IsString()
  public paymentId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'paid',
    type: String,
  })
  @IsString()
  public status: string;

  @ApiProperty({
    description: 'Payment message',
    example: 'payment completion message',
    type: String,
  })
  @IsString()
  public message: string;
}
