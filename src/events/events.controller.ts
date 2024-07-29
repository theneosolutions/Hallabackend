import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AuthResponseUserMapper } from '../auth/mappers/auth-response-user.mapper';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { join } from 'path';
import { IMessage } from 'src/common/interfaces/message.interface';
import { UpdateEventDto } from './dtos/update-event.dto';
import { ResponseEventsMapper } from './mappers/response-events.mapper';
import { ResponseMediaMapper } from './mappers/response-media.mapper';
import { IEventMedia } from './interfaces/media.interface';
import { EventGuestsDto } from './dtos/create-guests-event.dto';
import { GetInviteCodeParams } from './dtos/get-invite-code.params';
import { Contacts } from 'src/contacts/entities/contacts.entity';
import { ContactsPageOptionsDto } from './dtos/contacts-page-option.dto';
import { GetQRCodeParams } from './dtos/get-qrcode-params';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'Event is created and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async create(
    @CurrentUser() id: number,
    @Origin() origin: string | undefined,
    @Body() eventDto: EventDto,
  ): Promise<IResponseEvent> {
    const event = await this.eventsService.create(origin, eventDto);
    return ResponseEventsMapper.map(event);
  }

  @Get()
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: AuthResponseUserMapper,
    description: 'The email is updated, and the user is returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body, or wrong password.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async getAll(
    @CurrentUser() id: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Events>> {
    return await this.eventsService.getAll(pageOptionsDto);
  }

  @Get('/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'event is found and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'eventItem is not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async getEventDetail(@Param() params: GetEventParams): Promise<any> {
    const eventItem = await this.eventsService.findEventById(params.id);
    return eventItem;
  }

  @Post('addGuests/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'Event is created and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async addContactsIntoEvent(
    @Body() eventGuestsDto: EventGuestsDto,
    @Param() params: GetEventParams,
  ): Promise<IResponseEvent> {
    const event = await this.eventsService.addContactsIntoEvent(
      eventGuestsDto,
      params?.id,
    );
    return ResponseEventsMapper.map(event);
  }

  @Post('send-invites/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'Event invitations is sent and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async sendEventInvites(
    @CurrentUser() id: number, // logged in user id
    @Param() params: GetEventParams,
  ): Promise<IResponseEvent> {
    const event = await this.eventsService.sendEventInvites(id, params?.id);
    return ResponseEventsMapper.map(event);
  }

  @Get('send-reminder/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'Event invitations is sent and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async sendEventsReminder(
    @CurrentUser() id: number,
    @Param() params: GetEventParams,
  ): Promise<IResponseEvent> {
    const event = await this.eventsService.sendEventsReminder(id, params?.id);
    return ResponseEventsMapper.map(event);
  }

  @Get('scan-qrcode/:code')
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'Event invitations is scaned and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  public async scanEventInvite(
    @Param() params: GetInviteCodeParams,
  ): Promise<IMessage> {
    return await this.eventsService.scanEventInvite(params?.code);
  }

  @Get('create-qrcode/:contactId/:eventId')
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'QRcode created.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  public async createQRcode(
    @Param() params: GetQRCodeParams,
  ): Promise<IMessage> {
    return await this.eventsService.createQRCode(
      params.contactId,
      params.eventId,
    );
  }

  @Public(['admin', 'user'])
  @Get('/categorize/byUserId/:id')
  @ApiPaginatedResponse(ResponseEventsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'event not found.',
  })
  async categorizeEvents(
    @Param() params: GetEventByUserIdParams,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    const userId = Number(params.id);
    return this.eventsService.categorizeEvents(userId, pageOptionsDto);
  }

  @Public(['admin', 'user'])
  @Get('/byUserId/:id')
  @ApiPaginatedResponse(ResponseEventsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'event not found.',
  })
  async getCompanyByUserId(
    @Param() params: GetEventByUserIdParams,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    return this.eventsService.getEventsByUserId(params.id, pageOptionsDto);
  }

  @Public(['admin', 'user'])
  @Get('/guestlist/:id')
  @ApiPaginatedResponse(ResponseEventsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'No Guest found.',
  })
  async getGuestsByEventId(
    @Param() params: GetEventByUserIdParams,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    return this.eventsService.getGuestsByEventId(params.id, pageOptionsDto);
  }

  @Delete('/:id')
  @Public(['admin', 'user'])
  @ApiNoContentResponse({
    description: 'The event is deleted.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async delete(
    @CurrentUser() id: number,
    @Param() params: GetEventParams,
  ): Promise<IMessage> {
    return await this.eventsService.delete(params.id);
  }

  @Patch('/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseEventsMapper,
    description: 'Event is updated.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async update(
    @CurrentUser() id: number,
    @Param() params: GetEventParams,
    @Body() dto: UpdateEventDto,
  ): Promise<IResponseEvent> {
    const company = await this.eventsService.update(params.id, dto, id);
    return ResponseEventsMapper.map(company);
  }

  @Public(['admin', 'user'])
  @Get('/chats/messages/user/:userId/event/:eventId/contact/:contactId')
  @ApiPaginatedResponse(ResponseEventsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'event not found.',
  })
  async getAllChatMessagesOfEvent(
    @Param() params: any,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    return this.eventsService.getAllChatMessagesOfEvent(
      params.eventId,
      params.userId,
      params.contactId,
      pageOptionsDto,
    );
  }

  @Public(['admin', 'user'])
  @Get('/chats/user/:userId/event/:eventId')
  @ApiPaginatedResponse(ResponseEventsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'event not found.',
  })
  async getAllChatsOfEvent(
    @Param() params: any,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    return this.eventsService.getAllChatsOfEvent(
      params.eventId,
      params.userId,
      pageOptionsDto,
    );
  }

  @Public(['admin', 'user'])
  @Get('/chats/user/:userId')
  @ApiPaginatedResponse(ResponseEventsMapper)
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'event not found.',
  })
  async getAllChatsOfUser(
    @Param() params: any,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    return this.eventsService.getAllChatsOfUser(params.userId, pageOptionsDto);
  }

  // @Public(['admin', 'user'])
  @Get('qrcodes/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(join(__dirname, '..', '..', 'qrcodes', `${fileId}`));
  }

  @Post('/upload-event-image')
  @Public(['admin', 'user'])
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileType: {
          type: 'string',
          enum: ['event'],
        },
      },
    },
  })
  @ApiOkResponse({
    type: ResponseMediaMapper,
    description: 'file is uploaded and return file url.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'The user is not found.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
  ): Promise<IEventMedia> {
    console.log(
      '🚀 ~ file: users.controller.ts:105 ~ UsersController ~ @Body ~ dto',
      dto,
      file,
    );
    const { ratio, fileType } = dto;
    const uploadedFile = await this.eventsService.uploadImage(
      file,
      ratio,
      fileType,
    );
    return ResponseMediaMapper.map({
      link: uploadedFile,
      type: 'jpeg', // use jpeg as per amazon available exentsion
    });
  }

  @Delete('/remove/guest/:eventId/:contactsId')
  async deleteRecordByEventAndContact(
    @Param('eventId') eventId: number,
    @Param('contactsId') contactsId: number,
  ): Promise<IMessage> {
    return await this.eventsService.deleteRecordByEventAndContact(
      eventId,
      contactsId,
    );
  }

  @Get('/get-contact-list/:id')
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: PageDto<Contacts>,
    description: 'event is found and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'eventItem is not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not logged in.',
  })
  public async getContactList(
    @Param() params: GetEventParams,
    @Query() pageOptionsDto: ContactsPageOptionsDto,
  ): Promise<PageDto<Contacts>> {
    // console.log('there');

    return await this.eventsService.getContactList(params.id, pageOptionsDto);
  }
}
