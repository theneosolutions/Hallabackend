import {
    BadRequestException,
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
    ApiQuery,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IAuthResponseUser } from '../auth/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from '../auth/mappers/auth-response-user.mapper';
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from 'express';
import { IResponseEvent } from './interfaces/response-event.interface';
import { EventsService } from './events.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { GetEventParams } from './dtos/get-event.params';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { Events } from './entities/event.entity';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { GetEventByUserIdParams } from './dtos/get-events-by-userid.params';
import { EventDto } from './dtos/create-event.dto';
import { extname } from 'path';
import { MessageMapper } from 'src/common/mappers/message.mapper';
import { IMessage } from 'src/common/interfaces/message.interface';
import { UpdateEventDto } from './dtos/update-event.dto';
import { userInfo } from 'os';

@ApiTags('Events')
@Controller('api/events')
export class EventsController {

    constructor(
        private readonly eventsService: EventsService,
        private readonly configService: ConfigService,
    ) { }

    
}

