import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { ChangeEmailDto } from './dtos/change-email.dto';
import { GetUserParams } from './dtos/get-user.params';
import { PasswordDto } from './dtos/password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { IResponseUser } from './interfaces/response-user.interface';
import { ResponseUserMapper } from './mappers/response-user.mapper';
import { UsersService } from './users.service';
import { UsernameDto } from './dtos/username.dto';
import { PageOptionsDto } from './dtos/page-option.dto';
import { Users } from './entities/user.entity';
import { PageDto } from './dtos/page.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private cookiePath = '/api/auth';
  private cookieName: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
  }

  @Get('')
  // @Public(['admin'])
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
  ): Promise<PageDto<Users>> {
    return await this.usersService.getAll(pageOptionsDto);
  }

  @Patch()
  @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The username is updated.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async updateUser(
    @CurrentUser() id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<IResponseUser> {
    console.log('🚀 ~ UsersController ~ id:', id);
    const user = await this.usersService.update(id, dto);
    return ResponseUserMapper.map(user);
  }

  @Patch('/email')
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
  public async updateEmail(
    @CurrentUser() id: number,
    @Body() dto: ChangeEmailDto,
  ): Promise<IAuthResponseUser> {
    const user = await this.usersService.updateEmail(id, dto);
    return AuthResponseUserMapper.map(user);
  }

  @Patch('/username')
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
  public async updateUsername(
    @CurrentUser() id: number,
    @Body() dto: UsernameDto,
  ): Promise<IAuthResponseUser> {
    const user = await this.usersService.updateUsername(id, dto);
    return AuthResponseUserMapper.map(user);
  }

  @Delete()
  @Public(['admin', 'user'])
  @ApiNoContentResponse({
    description: 'The user is deleted.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body, or wrong password.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async deleteUser(
    @CurrentUser() id: number,
    @Body() dto: PasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.usersService.delete(id, dto);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.NO_CONTENT)
      .send();
  }

  // parametric routes

  @Get('/:idOrUsername')
  // @Public(['admin', 'user'])
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The user is found and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'The user is not found.',
  })
  public async getUser(@Param() params: GetUserParams): Promise<IResponseUser> {
    const user = await this.usersService.findOneByIdOrUsername(
      params.idOrUsername,
    );
    return ResponseUserMapper.map(user);
  }
}
