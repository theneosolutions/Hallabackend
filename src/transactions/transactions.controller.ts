import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { IResponseTransactions } from './interfaces/response-transactions.interface';
import { ResponseTransactionsMapper } from './mappers/response-transactions.mapper';
import { TransactionsService } from './transactions.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { TransactionDto } from './dtos/create-transaction';
import { GetTransactionParams } from './dtos/get-transaction.params';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { GetContactsByUserIdParams } from 'src/contacts/dtos/get-contacts-by-userid.params';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { IMessage } from 'src/common/interfaces/message.interface';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseTransactionsMapper,
    description: 'transaction is found and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'transactionItem is not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async findCompanyById(
    @Param() params: GetTransactionParams,
  ): Promise<any> {
    const contactItem = await this.transactionsService.findTransactionById(
      params.id,
    );
    return contactItem;
  }

  @Post()
  @ApiOkResponse({
    type: ResponseTransactionsMapper,
    description: 'transaction is created and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async create(
    @CurrentUser() id: number,
    @Origin() origin: string | undefined,
    @Body() contactsDto: TransactionDto,
  ): Promise<IResponseTransactions> {
    const transaction = await this.transactionsService.create(
      origin,
      contactsDto,
    );
    return ResponseTransactionsMapper.map(transaction);
  }

  @Public(['admin', 'user'])
  @Get('/byUserId/:id')
  @ApiPaginatedResponse(ResponseTransactionsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'transaction not found.',
  })
  async getCompanyByUserId(
    @Param() params: GetContactsByUserIdParams,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<TransactionDto>> {
    return this.transactionsService.getTransactionsByUserId(
      params.id,
      pageOptionsDto,
    );
  }

  @Post('/webhook')
  @ApiOkResponse({
    type: ResponseTransactionsMapper,
    description: 'transaction is created and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'transaction not found.',
  })
  async updateUserTransactionStatus(
    @Query() query: any,
    @Body() webhookData: any,
  ): Promise<ResponseTransactionsMapper> {
    // Validate token secret
    const tokenSecretFromEnv = process.env.WEBHOOK_TOKEN_SECRET;
    if (webhookData.secret_token !== tokenSecretFromEnv) {
      throw new Error('Invalid token secret');
    }
    const { data } = webhookData;
    console.log('🚀 ~ TransactionsController ~ data:', data);
    const { status, amount, currency, id } = data;
    const updatedTransaction =
      await this.transactionsService.updateUserTransactionStatus(
        id,
        status,
        amount,
        currency,
      );
    return ResponseTransactionsMapper.map(updatedTransaction);
  }

  @Patch('/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseTransactionsMapper,
    description: 'transaction is updated.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async updateContact(
    @CurrentUser() id: number,
    @Param() params: GetTransactionParams,
    @Body() dto: UpdateTransactionDto,
  ): Promise<IResponseTransactions> {
    const transaction = await this.transactionsService.update(params.id, dto);
    return ResponseTransactionsMapper.map(transaction);
  }

  @Delete('/:id')
  @Public(['admin', 'user'])
  @ApiNoContentResponse({
    description: 'The transaction is deleted.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async delete(
    @CurrentUser() id: number,
    @Param() params: GetTransactionParams,
  ): Promise<IMessage> {
    return await this.transactionsService.delete(params.id);
  }
}
