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
import { IResponseTransactions } from './interfaces/response-transactions.interface';
import { ResponseTransactionsMapper } from './mappers/response-stats.mapper';
import { StatsService } from './stats.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { GetContactsByUserIdParams } from 'src/contacts/dtos/get-contacts-by-userid.params';
import { IMessage } from 'src/common/interfaces/message.interface';

@ApiTags('Stats')
@Controller('api/stats')
export class StatsController {
  constructor(
    private readonly StatsService: StatsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  // @Public(['admin', 'user'])
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
  public async findCompanyById(): Promise<any> {
    // console.log('there');

    const stats = await this.StatsService.getDashboardStats();
    return stats;
  }
}
