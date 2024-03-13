import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
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
import { Response, query } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IAuthResponseUser } from '../auth/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from '../auth/mappers/auth-response-user.mapper';
import { GetUserParams } from './dtos/get-user.params';
import { UpdateContactsDto } from './dtos/update-contacts.dto';
import { IResponseContacts } from './interfaces/response-contacts.interface';
import { ResponseContactsMapper } from './mappers/response-contacts.mapper';
import { WhatsappService } from './whatsapp.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { ContactsDto } from './dtos/create-contacts';

@ApiTags('Whatsapp')
@Controller('api/whatsapp')
export class WhatsappController {

    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly configService: ConfigService,
    ) {

    }

    @Get('/meta_wa_callbackurl')
    @ApiOkResponse({
        description: 'The user is found and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'The user is not found.',
    })
    public async meta_wa_callbackurl(
        @Param() params: any,
        @Query() query: any
    ): Promise<any> {
        console.log('GET: Someone is pinging me!');
        let mode = query['hub.mode'];
        console.log("🚀 ~ WhatsappController ~ mode:", mode)
        let token = query['hub.verify_token'];
        console.log("🚀 ~ WhatsappController ~ token:", token)
        let challenge = query['hub.challenge'];
        console.log("🚀 ~ WhatsappController ~ challenge:", challenge)
        console.log("🚀 ~ WhatsappController ~ process.env.Meta_WA_VerifyToken:", process.env.Meta_WA_VerifyToken)

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            process.env.Meta_WA_VerifyToken == token
        ) {
            return challenge;
        } else {
            throw new ForbiddenException();
        }
    }

    @Post('/meta_wa_callbackurl')
    @ApiOkResponse({
        description: 'The user is found and returned.',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiNotFoundResponse({
        description: 'The user is not found.',
    })
    public async meta_wa_post_callbackurl(
        @Param() params: any,
        @Query() query: any,
        @Origin() origin: string | undefined,
        @Body() body: any
    ): Promise<any> {
        console.log('POST: Someone is pinging me!');
        const contact = await this.whatsappService.create(origin, body);
        return null;
    }


}