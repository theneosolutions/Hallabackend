import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from '../transactions.service';
import { TransactionDto } from '../dtos/create-transaction';
import { ResponseTransactionsMapper } from '../mappers/response-transactions.mapper';
import { PageOptionsDto } from '../dtos/page-option.dto';
import { PageDto } from '../dtos/page.dto';
import { ApiPaginatedResponse } from '../decorators/api-paginated-response.decorator';

@ApiTags('Transactions | Admin')
@Controller('/admin/transactions')
export class TransactionsAdminController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  // @Public(['admin', 'user'])
  @ApiPaginatedResponse(ResponseTransactionsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'The Transaction is not found.',
  })
  async getPackages(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<TransactionDto>> {
    return this.transactionsService.getTransactions(pageOptionsDto);
  }

  // @Get('/:id')
  // @ApiOkResponse({
  //     type: ResponseTransactionsMapper,
  //     description: 'Transaction is found and returned.',
  // })
  // @ApiBadRequestResponse({
  //     description: 'Something is invalid on the request body',
  // })
  // @ApiNotFoundResponse({
  //     description: 'Transaction is not found.',
  // })
  // @ApiUnauthorizedResponse({
  //     description: 'User is not logged in.',
  // })
  // public async getByPackageId(@Param() params: GetPackageParams): Promise<IResponsePackages> {
  //     const packageInfo = await this.packagesService.findOneById(params.id);
  //     return ResponsePackagesMapper.map(packageInfo);
  // }
}
