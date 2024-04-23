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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { IAuthResponseUser } from '../../auth/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from '../../auth/mappers/auth-response-user.mapper';

import { IResponseTransactions } from '../interfaces/response-transactions.interface';

import { TransactionsService } from '../transactions.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { TransactionDto } from '../dtos/create-transaction';
import { ResponseTransactionsMapper } from '../mappers/response-transactions.mapper';
import { GetTransactionParams } from '../dtos/get-transaction.params';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';
import { PageOptionsDto } from '../dtos/page-option.dto';
import { PageDto } from '../dtos/page.dto';
import { Transactions } from '../entities/transactions.entity';
import { ApiPaginatedResponse } from '../decorators/api-paginated-response.decorator';

@ApiTags('Transactions | Admin')
@Controller('/admin/transactions')
export class TransactionsAdminController {

    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly configService: ConfigService,
    ) { }
    
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
        @Query() pageOptionsDto: PageOptionsDto
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

