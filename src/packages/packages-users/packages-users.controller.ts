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

import { IResponsePackages } from '../interfaces/response-packages.interface';

import { PackagesService } from '../packages.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { PackagesDto } from '../dtos/create-packages.dto';
import { ResponsePackagesMapper } from '../mappers/response-packages.mapper';
import { GetPackageParams } from '../dtos/get-package.params';
import { UpdatePackageDto } from '../dtos/update-package.dto';
import { PageOptionsDto } from '../dtos/page-option.dto';
import { PageDto } from '../dtos/page.dto';
import { Packages } from '../entities/packages.entity';
import { ApiPaginatedResponse } from '../decorators/api-paginated-response.decorator';

@ApiTags('Packages')
@Controller('packages')
export class PackagesUsersController {
  constructor(
    private readonly packagesService: PackagesService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiPaginatedResponse(ResponsePackagesMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'The printer is not found.',
  })
  async getPackages(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<PackagesDto>> {
    return this.packagesService.getPackages(pageOptionsDto);
  }

  @Get('/:id')
  @ApiOkResponse({
    type: ResponsePackagesMapper,
    description: 'Package is found and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'Package is not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async getByPackageId(
    @Param() params: GetPackageParams,
  ): Promise<IResponsePackages> {
    const packageInfo = await this.packagesService.findOneById(params.id);
    return ResponsePackagesMapper.map(packageInfo);
  }
}
