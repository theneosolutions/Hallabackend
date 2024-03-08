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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ApiBadRequestResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
    ApiConflictResponse,
    ApiUnauthorizedResponse,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IAuthResponseUser } from '../auth/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from '../auth/mappers/auth-response-user.mapper';
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from 'express';
import { IResponseCard } from './interfaces/response-card.interface';
import { CardService } from './card.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ResponseCardMapper } from './mappers/response-card.mapper';
import { GetCardParams } from './dtos/get-card.params';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { Card } from './entities/card.entity';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { CardDto } from './dtos/create-card.dto';
import { extname } from 'path';
import { MessageMapper } from 'src/common/mappers/message.mapper';
import { IMessage } from 'src/common/interfaces/message.interface';
import { UpdateCardDto } from './dtos/update-card.dto';
import { GetCardByEventIdParams } from './dtos/get-card-by-EventId.params';

@ApiTags('Cards')
@Controller('api/cards')
export class CardController {

    constructor(
        private readonly cardService: CardService,
        private readonly configService: ConfigService,
    ) { }

    @Post('/create-card')
    @Public()
    @ApiOkResponse({
        type: ResponseCardMapper,
        description: 'Card is created and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiUnauthorizedResponse({
        description: 'User is not logged in.',
    })
    public async create(
        @CurrentUser() userId: number,
        @Origin() origin: string | undefined,
        @Body() cardDto: CardDto,
    ): Promise<IResponseCard> {

        return await this.cardService.create(origin, cardDto);
    }


    @Get()
    @Public()
    @ApiPaginatedResponse(ResponseCardMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'no section found.',
    })
    async getSections(
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<CardDto>> {

        return this.cardService.getCards(pageOptionsDto);
    }

    @Get('/:id')
    @Public()
    @ApiOkResponse({
        type: ResponseCardMapper,
        description: 'card is found and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'cardItem is not found.',
    })
    @ApiUnauthorizedResponse({
        description: 'User is not logged in.',
    })
    public async findSectionById(@Param() params: GetCardParams): Promise<IResponseCard> {
        const cardItem = await this.cardService.findCardById(params.id);
        return ResponseCardMapper.map(cardItem);
    }


}

