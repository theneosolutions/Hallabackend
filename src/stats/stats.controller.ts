import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseTransactionsMapper } from './mappers/response-stats.mapper';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller('stats')
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
