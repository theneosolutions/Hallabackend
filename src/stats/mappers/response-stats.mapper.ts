import { ApiProperty } from '@nestjs/swagger';
import { IResponseTransactions } from '../interfaces/response-transactions.interface';
import { ITransactions } from '../interfaces/transactions.interface';

export class ResponseTransactionsMapper implements IResponseTransactions {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  public user: number;

  @ApiProperty({
    description: 'Package id',
    example: 123,
    type: Number,
  })
  public package: number;

  @ApiProperty({
    description: 'Transaction amount',
    type: String,
  })
  public amount!: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'buy package',
    minLength: 3,
    maxLength: 200,
    required: false,
    type: String,
  })
  public description: string;

  @ApiProperty({
    description: 'Payment id',
    example: 'd18499f2-ea2a-4342-8b69-7d8ebfebe749',
    type: String,
  })
  public paymentId: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'active',
    type: String,
  })
  public status: string;

  @ApiProperty({
    description: 'Transaction creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public createdAt: string;

  @ApiProperty({
    description: 'User last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public updatedAt: string;

  constructor(values: IResponseTransactions) {
    Object.assign(this, values);
  }

  public static map(transaction: ITransactions): ResponseTransactionsMapper {
    return new ResponseTransactionsMapper({
      id: transaction.id,
      user: transaction.user,
      package: transaction?.package,
      amount: transaction.amount,
      description: transaction.description,
      paymentId: transaction.paymentId,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    });
  }
}
