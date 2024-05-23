import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export abstract class UpdateTransactionDto {
  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  public user: number;

  @ApiProperty({
    description: 'Transaction amount',
    type: String,
  })
  @IsString()
  @IsOptional()
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
  @IsOptional()
  public paymentId: string;

  @ApiProperty({
    description: 'status',
    example: 'Initiated/Paid/Failed',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @IsOptional()
  public status?: string;
}
