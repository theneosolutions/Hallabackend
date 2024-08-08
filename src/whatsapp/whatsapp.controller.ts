import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { Origin } from 'src/auth/decorators/origin.decorator';
import { Headers } from '@nestjs/common';

let requestCount = 0;
@ApiTags('Whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

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
    @Query() query: any,
  ): Promise<any> {
    console.log('GET: Someone is pinging me!');
    const mode = query['hub.mode'];
    console.log('🚀 ~ WhatsappController ~ mode:', mode);
    const token = query['hub.verify_token'];
    console.log('🚀 ~ WhatsappController ~ token:', token);
    const challenge = query['hub.challenge'];
    console.log('🚀 ~ WhatsappController ~ challenge:', challenge);
    console.log(
      '🚀 ~ WhatsappController ~ process.env.Meta_WA_VerifyToken:',
      process.env.Meta_WA_VerifyToken,
    );

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
  @HttpCode(200)
  public async meta_wa_post_callbackurl(
    @Headers() headers: any,
    @Param() params: any,
    @Query() query: any,
    @Origin() origin: string | undefined,
    @Body() body: any,
  ): Promise<void> {
    console.log('POST: Someone is pinging me!', requestCount++);
    console.log('REQUEST HEADERS', JSON.stringify(headers));
    return;
    await this.whatsappService.create(origin, body);
  }
}
