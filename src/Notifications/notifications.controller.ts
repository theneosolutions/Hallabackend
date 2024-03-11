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
import { IResponseNotifications } from './interfaces/response-notifications.interface';
import { NotificationsService } from './notifications.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ResponseNotificationMapper } from './mappers/response-notifications.mapper';
import { GetNotificationParams } from './dtos/get-notification.params';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { Notifications } from './entities/notifications.entity';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { GetNotificationByUserIdParams } from './dtos/get-notifications-by-userid.params';
import { GetNotificationByResourceTypeParams } from './dtos/get-notifications-by-resourcetype.params';
import { NotificationDto } from './dtos/create-notification.dto';
import { extname } from 'path';
import { IMessage } from 'src/common/interfaces/message.interface';

@ApiTags('Notifications')
@Controller('api/notifications')
export class NotificationsController {

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly configService: ConfigService,
    ) { }


    @Post()
    @Public()
    @ApiOkResponse({
        type: ResponseNotificationMapper,
        description: 'Notification is created and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiUnauthorizedResponse({
        description: 'User is not logged in.',
    })
    public async create(
        @Origin() origin: string | undefined,
        @Body() notificationDto: NotificationDto,
    ): Promise<IResponseNotifications> {

        return await this.notificationsService.create(origin, notificationDto);
    }




    @Get()
    @Public()
    @ApiPaginatedResponse(ResponseNotificationMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'no notification found.',
    })
    async getPackages(
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<Notifications>> {

        return this.notificationsService.getNotifications(pageOptionsDto);
    }



    @Get('/:id')
    @Public()
    @ApiOkResponse({
        type: ResponseNotificationMapper,
        description: 'notification is found and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'likeItem is not found.',
    })
    @ApiUnauthorizedResponse({
        description: 'User is not logged in.',
    })
    public async getByNotificationId(@Param() params: GetNotificationParams): Promise<IResponseNotifications> {
        const notificationItem = await this.notificationsService.findOneById(params.id);
        return ResponseNotificationMapper.map(notificationItem);
    }


    @Public()
    @Get('/notificationByUserId/:id')
    @ApiPaginatedResponse(ResponseNotificationMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'notifications not found.',
    })
    async getSubscriptionsByUserId(
        @Param() params: GetNotificationByUserIdParams,
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<Notifications>> {

        return this.notificationsService.getNotificationsByUserId(params.id, pageOptionsDto);
    }

    @Public()
    @Get('/unreadNotificationByUserId/:id')
    @ApiPaginatedResponse(ResponseNotificationMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'notifications not found.',
    })
    async unreadNotificationByUserId(
        @Param() params: GetNotificationByUserIdParams,
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<Notifications>> {

        return this.notificationsService.unreadNotificationByUserId(params.id, pageOptionsDto);
    }

    @Public()
    @Patch('/:id')
    @ApiPaginatedResponse(ResponseNotificationMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'notifications not found.',
    })
    async updateStatus(
        @Param() params: GetNotificationParams,
    ): Promise<IResponseNotifications> {

        const notificationItem = await this.notificationsService.updateStatus(Number(params.id));
        return ResponseNotificationMapper.map(notificationItem);
    }


    @Public()
    @Patch('/readAllNotificationByUserId/:id')
    @ApiPaginatedResponse(ResponseNotificationMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'notifications not found.',
    })
    async readAllNotificationByUserId(
        @Param() params: GetNotificationParams,
    ): Promise<IMessage> {
        return await this.notificationsService.readAllNotificationByUserId(Number(params.id));
    }


    @Get('/notificationsByResourceId/:id')
    @Public()
    @ApiPaginatedResponse(ResponseNotificationMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'resource not found.',
    })
    async getNotificationsByResourceId(
        @Param() params: GetNotificationByUserIdParams,
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<Notifications>> {

        return this.notificationsService.getNotificationsByResourceId(params.id, pageOptionsDto);
    }

    @Get('/notificationsByResourceType/:type')
    @Public()
    @ApiPaginatedResponse(ResponseNotificationMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'resource not found.',
    })
    async getNotificationsByResourceType(
        @Param() params: GetNotificationByResourceTypeParams,
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<Notifications>> {

        return this.notificationsService.getNotificationsByResourceType(params.type, pageOptionsDto);
    }



    @Delete('/:id')
    @Public()
    @ApiOkResponse({
        type: ResponseNotificationMapper,
        description: 'notification is found and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'notification not found.',
    })
    @ApiUnauthorizedResponse({
        description: 'User is not logged in.',
    })
    public async deleteByNotificationId(@Param() params: GetNotificationParams): Promise<IResponseNotifications> {
        const notificationItem = await this.notificationsService.deleteByNotificationId(Number(params.id));
        return ResponseNotificationMapper.map(notificationItem);
    }





}

