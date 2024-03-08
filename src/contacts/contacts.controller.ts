import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
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
import { GetUserParams } from './dtos/get-user.params';
import { UpdateContactsDto } from './dtos/update-contacts.dto';
import { IResponseContacts } from './interfaces/response-contacts.interface';
import { ResponseContactsMapper } from './mappers/response-contacts.mapper';
import { ContactsService } from './contacts.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ContactsDto } from './dtos/create-contacts';

@ApiTags('Contacts')
@Controller('api/contacts')
export class ContactsController {

    constructor(
        private readonly contactsService: ContactsService,
        private readonly configService: ConfigService,
    ) {

    }


    //     @Get('/:idOrUsername')
    //     @ApiOkResponse({
    //         type: ResponseUserMapper,
    //         description: 'The user is found and returned.',
    //     })
    //     @ApiBadRequestResponse({
    //         description: 'Something is invalid on the request body',
    //     })
    //     @ApiNotFoundResponse({
    //         description: 'The user is not found.',
    //     })
    //     public async getUser(@Param() params: GetUserParams): Promise<IResponseUser> {
    //         const user = await this.usersService.findOneByIdOrUsername(
    //             params.idOrUsername,
    //         );
    //         return ResponseUserMapper.map(user);
    //     }

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

    //     @Patch()
    //     @ApiOkResponse({
    //         type: ResponseUserMapper,
    //         description: 'The username is updated.',
    //     })
    //     @ApiBadRequestResponse({
    //         description: 'Something is invalid on the request body.',
    //     })
    //     @ApiUnauthorizedResponse({
    //         description: 'The user is not logged in.',
    //     })
    //     public async updateUser(
    //         @CurrentUser() id: number,
    //         @Body() dto: UpdateUserDto,
    //     ): Promise<IResponseUser> {
    //         const user = await this.usersService.update(id, dto);
    //         return ResponseUserMapper.map(user);
    //     }

    //     @Patch('/email')
    //     @ApiOkResponse({
    //         type: AuthResponseUserMapper,
    //         description: 'The email is updated, and the user is returned.',
    //     })
    //     @ApiBadRequestResponse({
    //         description: 'Something is invalid on the request body, or wrong password.',
    //     })
    //     @ApiUnauthorizedResponse({
    //         description: 'The user is not logged in.',
    //     })
    //     public async updateEmail(
    //         @CurrentUser() id: number,
    //         @Body() dto: ChangeEmailDto,
    //     ): Promise<IAuthResponseUser> {
    //         const user = await this.usersService.updateEmail(id, dto);
    //         return AuthResponseUserMapper.map(user);
    //     }

    //     @Delete()
    //     @ApiNoContentResponse({
    //         description: 'The user is deleted.',
    //     })
    //     @ApiBadRequestResponse({
    //         description: 'Something is invalid on the request body, or wrong password.',
    //     })
    //     @ApiUnauthorizedResponse({
    //         description: 'The user is not logged in.',
    //     })
    //     public async deleteUser(
    //         @CurrentUser() id: number,
    //         @Body() dto: PasswordDto,
    //         @Res() res: Response,
    //     ): Promise<void> {
    //         await this.usersService.delete(id, dto);
    //         res
    //             .clearCookie(this.cookieName, { path: this.cookiePath })
    //             .status(HttpStatus.NO_CONTENT)
    //             .send();
    //     }

}