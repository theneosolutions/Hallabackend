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
import { IAuthResponseUser } from '../auth/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from '../auth/mappers/auth-response-user.mapper';

import { IResponsePackages } from './interfaces/response-packages.interface';

import { PackagesService } from './packages.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { PackagesDto } from './dtos/create-packages.dto';
import { ResponsePackagesMapper } from './mappers/response-packages.mapper';
import { GetPackageParams } from './dtos/get-package.params';
import { UpdatePackageDto } from './dtos/update-package.dto';
import { Packages } from './entities/packages.entity';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';

@ApiTags('Packages')
@Controller('admin/packages')
export class PackagesController {

    constructor(
        private readonly packagesService: PackagesService,
        private readonly configService: ConfigService,
    ) { }

    @Public('admin')
    @Post()
    @ApiOkResponse({
        type: ResponsePackagesMapper,
        description: 'Package is created and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiUnauthorizedResponse({
        description: 'User is not logged in.',
    })
    public async create(
        @Origin() origin: string | undefined,
        @Body() packagesDto: PackagesDto,
    ): Promise<IResponsePackages> {

        return await this.packagesService.create(origin, packagesDto);
    }


    // @Public('admin')
    @Get()
    @ApiPaginatedResponse(ResponsePackagesMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'The printer is not found.',
    })
    async getPackages(
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<PackagesDto>> {

        return this.packagesService.getPackages(pageOptionsDto);
    }



    @Public('admin')
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
    public async getByPackageId(@Param() params: GetPackageParams): Promise<IResponsePackages> {
        const packageInfo = await this.packagesService.findOneById(params.id);
        return ResponsePackagesMapper.map(packageInfo);
    }


    @Public('admin')
    @Patch('/:id')
    @ApiOkResponse({
        type: ResponsePackagesMapper,
        description: 'Package is updated.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body.',
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in.',
    })
    public async updatePackage(
        @Param() params: GetPackageParams,
        @Body() dto: UpdatePackageDto,
    ): Promise<IResponsePackages> {

        const updateResponse = await this.packagesService.updatePackageByID(params.id, dto);
        return ResponsePackagesMapper.map(updateResponse);

    }


    @Public('admin')
    @Delete('/:id')
    @ApiOkResponse({
        type: ResponsePackagesMapper,
        description: 'Package is found and deleted.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body, or wrong password.',
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in.',
    })
    public async deletePackage(@Param() params: GetPackageParams): Promise<ResponsePackagesMapper> {
        const packageInfo = await this.packagesService.findPackageByIdAndDelete(params.id);
        return ResponsePackagesMapper.map(packageInfo);
    }





}

