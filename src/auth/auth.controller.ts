import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    Res,
    Param,
    UnauthorizedException,
    UseGuards, Logger,
    LoggerService,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Request, Response } from 'express-serve-static-core';
import { IMessage } from '../common/interfaces/message.interface';
import { MessageMapper } from '../common/mappers/message.mapper';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Origin } from './decorators/origin.decorator';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { IAuthResponseUser } from './interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from './mappers/auth-response-user.mapper';
import { AuthResponseMapper } from './mappers/auth-response.mapper';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { GoogleDto } from './dtos/google.dto';
import { config } from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { FacebookDto } from './dtos/facebook.dto';
import axios from 'axios';
import { DiscordDto } from './dtos/discord.dto';
import { PhoneDto } from './dtos/phone.dto';
import { PhoneOTPDto } from './dtos/phone-otp.dto';
import { ResetPasswordWithPhoneDto } from './dtos/reset-password-phone.dto';
import { EmailOTPDto } from './dtos/email-otp.dto';

const btoa = require('btoa');
const qs = require('qs');
const appleSignin = require("apple-signin-auth");
config();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
);
@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
    private readonly cookiePath = '/api/auth';
    private readonly cookieName: string;
    private readonly refreshTime: number;
    private readonly testing: boolean;
    private readonly loggerService: LoggerService;

    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,

    ) {
        this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
        this.refreshTime = this.configService.get<number>('jwt.refresh.time');
        this.testing = this.configService.get<boolean>('testing');
        this.loggerService = new Logger(AuthController.name);
    }

   
    @Post('/sign-up')
    @ApiCreatedResponse({
        type: MessageMapper,
        description: 'The user has been created and is waiting confirmation',
    })
    @ApiConflictResponse({
        description: 'Email already in use',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    public async signUp(
        @Origin() origin: string | undefined,
        @Body() signUpDto: SignUpDto,
    ): Promise<IMessage> {
        return await this.authService.signUp(signUpDto, origin);
    }

    
    @Post('/sign-up/phone')
    @ApiCreatedResponse({
        type: MessageMapper,
        description: 'The user has been created and is waiting confirmation',
    })
    @ApiConflictResponse({
        description: 'Phone number already in use',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    public async signUpWithPhone(
        @Origin() origin: string | undefined,
        @Body() phoneDto: PhoneDto,
        @Res() res: Response,
    ): Promise<IMessage> {
        return await this.authService.signUpWithPhone(phoneDto, origin);
    }

    
    @Post('/sign-in')
    @ApiOkResponse({
        type: AuthResponseMapper,
        description: 'Logs in the user and returns the access token',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials or User is not confirmed',
    })
    public async signIn(
        @Res() res: Response,
        @Origin() origin: string | undefined,
        @Body() singInDto: SignInDto,
    ): Promise<void> {
        const result = await this.authService.signIn(singInDto, origin);
        this.saveRefreshCookie(res, result.refreshToken)
            .status(HttpStatus.OK)
            .json(AuthResponseMapper.map(result));
    }

  
    @Post('/sign-in/phone')
    @ApiOkResponse({
        type: MessageMapper,
        description: 'The user has been created and is waiting confirmation',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials or User is not found',
    })
    public async signInWithPhone(
        @Origin() origin: string | undefined,
        @Body() phoneDto: PhoneDto,
    ): Promise<IMessage> {
        const message = await this.authService.signInWithPhone(phoneDto, origin);
        console.log("🚀 ~ AuthController ~ message:", message)
        return message;
    }

   
    @Post('/otp/resend')
    @ApiCreatedResponse({
        type: MessageMapper,
        description: 'OTP sent and is waiting confirmation',
    })
    @ApiNotFoundResponse({
        description: 'No User found with this phone number',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    public async reSendUserOTP(
        @Origin() origin: string | undefined,
        @Body() phoneDto: PhoneDto,
    ): Promise<IMessage> {
        return await this.authService.reSendUserOTP(phoneDto, origin);
    }

    
    @Post('/otp/verify')
    @ApiOkResponse({
        type: AuthResponseMapper,
        description: 'Logs in the user and returns the access token',
    })
    @ApiNotFoundResponse({
        description: 'No User found with this phone number',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    public async verifyUserOTP(
        @Res() res: Response,
        @Origin() origin: string | undefined,
        @Body() phoneOTPDto: PhoneOTPDto,
    ): Promise<void> {
        const result = await this.authService.verifyUserOTP(phoneOTPDto, origin);
        this.saveRefreshCookie(res, result.refreshToken)
            .status(HttpStatus.OK)
            .json(AuthResponseMapper.map(result));
    }

    @Post('/otp/verify/email')
    @ApiOkResponse({
        type: AuthResponseMapper,
        description: 'Logs in the user and returns the access token',
    })
    @ApiNotFoundResponse({
        description: 'No User found with this phone number',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    public async verifyUserEmail(
        @Res() res: Response,
        @Origin() origin: string | undefined,
        @Body() emailOTPDto: EmailOTPDto,
    ): Promise<void> {
        const result = await this.authService.verifyUserEmailOTP(emailOTPDto, origin);
        this.saveRefreshCookie(res, result.refreshToken)
            .status(HttpStatus.OK)
            .json(AuthResponseMapper.map(result));
    }

    @Public(['admin', 'user'])
    @Post('/logout')
    @ApiOkResponse({
        type: MessageMapper,
        description: 'The user is logged out',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid token',
    })
    public async logout(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const token = this.refreshTokenFromReq(req);
        const message = await this.authService.logout(token);
        res
            .clearCookie(this.cookieName, { path: this.cookiePath })
            .status(HttpStatus.OK)
            .json(message);
    }

    
    @Post('/refresh-access')
    @ApiOkResponse({
        type: AuthResponseMapper,
        description: 'Refreshes and returns the access token',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid token',
    })
    @ApiBadRequestResponse({
        description:
            'Something is invalid on the request body, or Token is invalid or expired',
    })
    public async refreshAccess(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const token = this.refreshTokenFromReq(req);
        console.log("🚀 ~ AuthController ~ token:", token)
        const result = await this.authService.refreshTokenAccess(
            token,
            req.headers.origin,
        );
        this.saveRefreshCookie(res, result.refreshToken)
            .status(HttpStatus.OK)
            .json(AuthResponseMapper.map(result));
    }


    @Post('/google')
    @ApiCreatedResponse({
        type: AuthResponseMapper,
        description: 'Logs in the user and returns the access token',
    })
    @ApiBadRequestResponse({
        description: 'Something is invalid on the request body',
    })
    public async googleToken(
        @Origin() origin: string | undefined,
        @Body() GoogleDto: GoogleDto,
        @Res() res: Response,
    ): Promise<void> {
        const { idToken } = GoogleDto;
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const userDetail: any = ticket.getPayload();
        const { name, email, picture, given_name, family_name } = userDetail;
        const newUser = {
            email: email,
            firstName: given_name,
            lastName: family_name,
            picture: picture,
            accessToken: idToken
        }

        if (isUndefined(newUser) && isNull(newUser)) {
            throw new UnauthorizedException();
        }
        const result = await this.authService.googleLogin(newUser, origin);
        this.saveRefreshCookie(res, result.refreshToken)
            .status(HttpStatus.OK)
            .json(AuthResponseMapper.map(result));

    }




    
    @Get('/confirm-email/:confirmationToken')
    @ApiOkResponse({
        type: AuthResponseMapper,
        description: 'Confirms the user email and returns the access token',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid token',
    })
    @ApiBadRequestResponse({
        description:
            'Something is invalid on the request body, or Token is invalid or expired',
    })
    public async confirmEmail(
        @Origin() origin: string | undefined,
        @Param() confirmEmailParams: ConfirmEmailDto,
        @Res() res: Response,
    ): Promise<void> {
        const result = await this.authService.confirmEmail(confirmEmailParams);
        this.saveRefreshCookie(res, result.refreshToken)
            .status(HttpStatus.OK)
            .json(AuthResponseMapper.map(result));
    }

    
    @Post('/forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: MessageMapper,
        description:
            'An email has been sent to the user with the reset password link',
    })
    public async forgotPassword(
        @Origin() origin: string | undefined,
        @Body() emailDto: EmailDto,
    ): Promise<IMessage> {
        return this.authService.resetPasswordEmail(emailDto, origin);
    }

   
    @Post('/reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: MessageMapper,
        description: 'The password has been reset',
    })
    @ApiBadRequestResponse({
        description:
            'Something is invalid on the request body, or Token is invalid or expired',
    })
    public async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<IMessage> {
        return this.authService.resetPassword(resetPasswordDto);
    }

   
    @Post('/reset-password/phone')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: MessageMapper,
        description: 'The password has been reset',
    })
    @ApiBadRequestResponse({
        description:
            'Something is invalid on the request body, or Token is invalid or expired',
    })
    public async resetPasswordWithPhone(
        @Body() resetPasswordWithPhoneDto: ResetPasswordWithPhoneDto,
    ): Promise<IMessage> {
        return this.authService.resetPasswordWithPhone(resetPasswordWithPhoneDto);
    }

    @Patch('/update-password')
    @Public(['admin', 'user'])
    @ApiOkResponse({
        type: AuthResponseMapper,
        description: 'The password has been updated',
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in.',
    })
    public async updatePassword(
        @CurrentUser() userId: number,
        @Origin() origin: string | undefined,
        @Body() changePasswordDto: ChangePasswordDto,
        @Res() res: Response,
    ): Promise<void> {
        const result = await this.authService.updatePassword(
            userId,
            changePasswordDto,
            origin,
        );
        this.saveRefreshCookie(res, result.refreshToken)
            .status(HttpStatus.OK)
            .json(AuthResponseMapper.map(result));
    }

    @Get('/me')
    @Public(['admin', 'user'])
    @ApiOkResponse({
        type: AuthResponseUserMapper,
        description: 'The user is found and returned.',
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in.',
    })
    public async getMe(@CurrentUser() id: number): Promise<IAuthResponseUser> {
        const user = await this.usersService.findOneById(id);
        return AuthResponseUserMapper.map(user);
    }

    private refreshTokenFromReq(req: Request): string {
        const token: string | undefined = req.signedCookies[this.cookieName];
        if (isUndefined(token)) {
            throw new UnauthorizedException();
        }

        return token;
    }

    private saveRefreshCookie(res: Response, refreshToken: string): Response {
        return res.cookie(this.cookieName, refreshToken, {
            secure: !this.testing,
            httpOnly: true,
            sameSite: 'strict',
            signed: true,
            path: this.cookiePath,
            expires: new Date(Date.now() + this.refreshTime * 1000),
        });
    }
}