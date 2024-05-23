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
import { PageService } from './pages.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { GetContactsByUserIdParams } from 'src/contacts/dtos/get-contacts-by-userid.params';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { IMessage } from 'src/common/interfaces/message.interface';
import { PageMapper } from './mappers/response-transactions.mapper';
import { CreatePageDto } from './dtos/create-page';
import { Page } from './entities/page.entity';
import { UpdatePageDto } from './dtos/update-page.dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(
    private readonly pageService: PageService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiOkResponse({
    description: 'Page is created and returned.',
    type: PageMapper,
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
    @Body() dto: CreatePageDto,
  ): Promise<PageMapper> {
    const page = await this.pageService.create(dto);

    const result = PageMapper.map(page);

    return result;
  }

  @Get()
  @ApiOkResponse({
    description: 'Pages are retrieved and returned.',
    type: PageMapper,
  })
  public async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<any> {
    const pages = await this.pageService.findAll(pageOptionsDto);
    return pages;
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Page is retrieved and returned.',
    type: PageMapper,
  })
  @ApiNotFoundResponse({
    description: 'Page with the specified ID not found.',
  })
  public async findById(@Param('id') id: number): Promise<PageMapper> {
    const page = await this.pageService.findById(id);
    return PageMapper.map(page);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Page is deleted.',
  })
  @ApiNotFoundResponse({
    description: 'Page with the specified ID not found.',
  })
  public async delete(@Param('id') id: number): Promise<void> {
    await this.pageService.delete(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Page is updated and returned.',
    type: PageMapper,
  })
  @ApiNotFoundResponse({
    description: 'Page with the specified ID not found.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  public async update(
    @Param('id') id: number,
    @Body() dto: UpdatePageDto,
  ): Promise<any> {
    const page = await this.pageService.update(id, dto);
    return PageMapper.map(page);
  }
}
