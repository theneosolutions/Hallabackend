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
import { UpdateContactsDto } from './dtos/update-contacts.dto';
import { IResponseContacts } from './interfaces/response-contacts.interface';
import { ResponseContactsMapper } from './mappers/response-contacts.mapper';
import { ContactsService } from './contacts.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ContactsDto } from './dtos/create-contacts';
import { GetContactParams } from './dtos/get-contact.params';
import { ApiPaginatedResponse } from './decorators/api-paginated-response.decorator';
import { GetContactsByUserIdParams } from 'src/contacts/dtos/get-contacts-by-userid.params';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { IMessage } from 'src/common/interfaces/message.interface';

@ApiTags('Contacts')
@Controller('api/contacts')
export class ContactsController {

    constructor(
        private readonly contactsService: ContactsService,
        private readonly configService: ConfigService,
    ) {

    }


    @Get('/:id')
    @Public(['admin', 'user'])
    @ApiOkResponse({
        type: ResponseContactsMapper,
        description: 'contact is found and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'contactItem is not found.',
    })
    @ApiUnauthorizedResponse({
        description: 'User is not logged in.',
    })
    public async findCompanyById(@Param() params: GetContactParams): Promise<any> {
        const contactItem = await this.contactsService.findContactById(params.id);
        return (contactItem);
    }

    @Post()
    @ApiOkResponse({
        type: ResponseContactsMapper,
        description: 'Contact is created and returned.',
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
        @Body() contactsDto: ContactsDto,
    ): Promise<IResponseContacts> {
        const contact = await this.contactsService.create(origin, contactsDto);
        return ResponseContactsMapper.map(contact);
    }

    @Public(['admin', 'user'])
    @Get('/byUserId/:id')
    @ApiPaginatedResponse(ResponseContactsMapper)
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'contact not found.',
    })
    async getCompanyByUserId(
        @Param() params: GetContactsByUserIdParams,
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<ContactsDto>> {

        return this.contactsService.getContactsByUserId(params.id, pageOptionsDto);
    }

    @Patch('/:id')
    @Public(['admin','user'])
    @ApiOkResponse({
        type: ResponseContactsMapper,
        description: 'contact is updated.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body.',
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in.',
    })
    public async updateContact(
        @CurrentUser() id: number,
        @Param() params: GetContactParams,
        @Body() dto: UpdateContactsDto,
    ): Promise<IResponseContacts> {
        const contact = await this.contactsService.update(params.id, dto);
        return ResponseContactsMapper.map(contact);
    }

    @Delete('/:id')
    @Public(['admin','user'])
    @ApiNoContentResponse({
        description: 'The contact is deleted.',
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in.',
    })
    public async delete(
        @CurrentUser() id: number,
        @Param() params: GetContactParams,
    ): Promise<IMessage> {
       return  await this.contactsService.delete(params.id);

    }


}