import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IResponseCard } from './interfaces/response-card.interface';
import { CardService } from './card.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ResponseCardMapper } from './mappers/response-card.mapper';
import { GetCardParams } from './dtos/get-card.params';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { CardDto } from './dtos/create-card.dto';

@ApiTags('Cards')
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('/create-card')
  @Public(['admin'])
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
  @Public(['admin', 'user'])
  @ApiPaginatedResponse(ResponseCardMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'no section found.',
  })
  async getSections(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<CardDto>> {
    return this.cardService.getCards(pageOptionsDto);
  }

  @Get('/:id')
  @Public(['admin', 'user'])
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
  public async findSectionById(
    @Param() params: GetCardParams,
  ): Promise<IResponseCard> {
    const cardItem = await this.cardService.findCardById(params.id);
    return ResponseCardMapper.map(cardItem);
  }
}
