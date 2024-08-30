import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { isEmail } from 'class-validator';
import dayjs from 'dayjs';
import { CommonService } from '../common/common.service';
import { SLUG_REGEX } from '../common/consts/regex.const';
import { IMessage } from '../common/interfaces/message.interface';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { TokenTypeEnum } from '../jwt/enums/token-type.enum';
import { IEmailToken } from '../jwt/interfaces/email-token.interface';
import { IRefreshToken } from '../jwt/interfaces/refresh-token.interface';
import { JwtService } from '../jwt/jwt.service';
import { MailerService } from '../mailer/mailer.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Users } from '../users/entities/user.entity';
import { ICredentials } from '../users/interfaces/credentials.interface';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dtos/change-password.dto';

import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { IAuthResult } from './interfaces/auth-result.interface';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { PhoneDto } from './dtos/phone.dto';
import axios from 'axios';
import { PhoneOTPDto } from './dtos/phone-otp.dto';
import { ResetPasswordWithPhoneDto } from './dtos/reset-password-phone.dto';
import { EmailOTPDto } from './dtos/email-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokensRepository: Repository<BlacklistedToken>,
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  public async signUp(dto: SignUpDto, domain?: string): Promise<IMessage> {
    const { firstName, lastName, email, password1, password2, referredBy } =
      dto;
    this.comparePasswords(password1, password2);
    const user = await this.usersService.create(
      email,
      firstName,
      lastName,
      password1,
      referredBy,
    );
    const confirmationToken = await this.jwtService.generateToken(
      user,
      TokenTypeEnum.CONFIRMATION,
      domain,
    );
    this.mailerService.sendConfirmationEmail(user, confirmationToken);
    return this.commonService.generateMessage(
      `Registration successful.${user?.otp}`,
    );
  }

  public async signUpWithPhone(dto: PhoneDto): Promise<IMessage> {
    const { callingCode, phoneNumber } = dto;
    const user = await this.usersService.createUserWithPhone(
      callingCode,
      phoneNumber,
    );
    await this.sendOtpPhoneWithRetry(
      callingCode,
      phoneNumber,
      user?.otp,
      3,
      1000,
    );
    return this.commonService.generateMessage(
      `Registration successful.Please verify your phone number.${user?.otp}`,
    );
  }

  public async confirmEmail(dto: ConfirmEmailDto): Promise<IAuthResult> {
    const { confirmationToken } = dto;
    const { id, version } = await this.jwtService.verifyToken<IEmailToken>(
      confirmationToken,
      TokenTypeEnum.CONFIRMATION,
    );
    const user = await this.usersService.confirmEmail(id, version);
    const [accessToken, refreshToken] = await this.generateAuthTokens(user);
    return { user, accessToken, refreshToken };
  }

  public async signIn(dto: SignInDto, domain?: string): Promise<IAuthResult> {
    const { emailOrUsername, password } = dto;
    const user = await this.userByEmailOrUsername(emailOrUsername);
    if (!user?.id) {
      throw new BadRequestException(['Invalid credentials']);
    }

    if (dto.role === 'admin' && !user.roles.includes(dto.role)) {
      throw new BadRequestException([
        'User does not have Admin role to access it',
      ]);
    }

    if (!(await compare(String(password), String(user.password)))) {
      await this.checkLastPassword(user.credentials, password);
    }

    if (!user.confirmed) {
      const confirmationToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.CONFIRMATION,
        domain,
      );
      this.mailerService.sendConfirmationEmail(user, confirmationToken);
      throw new UnauthorizedException([
        'Please confirm your email, a new email has been sent',
      ]);
    }
    // Set user specific events expired (Those with passed date)
    await this.usersService.setEventsStatusExpired(user.id);

    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      domain,
    );

    return { user, accessToken, refreshToken };
  }

  public async signInWithPhone(
    dto: PhoneDto,
    domain?: string,
  ): Promise<IMessage> {
    const { callingCode, phoneNumber } = dto;
    const user = await this.userByPhoneNumber(callingCode, phoneNumber);
    if (!user?.id) {
      throw new BadRequestException(['Invalid credentials']);
    }
    await this.sendOtpPhoneWithRetry(
      callingCode,
      phoneNumber,
      user?.otp,
      3,
      1000,
    );
    return this.commonService.generateMessage(
      `Login successful.Please verify your phone number.${user?.otp}`,
    );
  }

  public async reSendUserOTP(
    dto: PhoneDto,
    domain?: string,
  ): Promise<IMessage> {
    const { callingCode, phoneNumber } = dto;
    const user = await this.userByPhoneNumber(callingCode, phoneNumber);

    await this.sendOtpPhoneWithRetry(
      callingCode,
      phoneNumber,
      user?.otp,
      3,
      1000,
    );
    return this.commonService.generateMessage(
      `OTP is sent to the User.${user?.otp}`,
    );
  }

  public async verifyForgotPasswordPhoneOTP(
    dto: PhoneOTPDto,
  ): Promise<IMessage> {
    await this.verifyUserPhoneOTP(dto);
    return this.commonService.generateMessage('OTP is verified');
  }

  public async verifyUserPhoneOTP(dto: PhoneOTPDto): Promise<Users> {
    const { callingCode, phoneNumber, otp } = dto;
    const user = await this.userByPhoneNumber(callingCode, phoneNumber);
    console.log('🚀 ~ AuthService ~ verifyUserPhoneOTP ~ user:', user);
    if (!user?.id) {
      throw new NotFoundException(['Invalid credentials']);
    }
    this.compareOTPs(user?.otp, otp);
    return user;
  }

  public async signInUserViaPhone(
    user: Users,
    domain?: string,
  ): Promise<IAuthResult> {
    await this.usersService.updateUserOTP(user?.id);
    // Set user specific events expired (Those with passed date)
    await this.usersService.setEventsStatusExpired(user.id);

    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      domain,
    );
    return { user, accessToken, refreshToken };
  }

  public async verifyUserEmailOTP(
    dto: EmailOTPDto,
    domain?: string,
  ): Promise<IAuthResult> {
    const { email, otp } = dto;
    const user = await this.userByEmailOrUsername(email);
    console.log('🚀 ~ AuthService ~ verifyUserEmailOTP ~ user:', user);
    if (!user?.id) {
      throw new NotFoundException(['Invalid credentials']);
    }
    this.compareOTPs(user?.otp, otp);
    await this.usersService.confirmEmail(user?.id, user?.credentials?.version);
    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      domain,
    );
    return { user, accessToken, refreshToken };
  }

  public async refreshTokenAccess(
    refreshToken: string,
    domain?: string,
  ): Promise<IAuthResult> {
    const { id, version, tokenId } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenTypeEnum.REFRESH,
      );
    await this.checkIfTokenIsBlacklisted(id, tokenId);
    const user = await this.usersService.findOneByCredentials(id, version);
    const [accessToken, newRefreshToken] = await this.generateAuthTokens(
      user,
      domain,
      tokenId,
    );
    return { user, accessToken, refreshToken: newRefreshToken };
  }

  public async googleLogin(newUser: any, domain?: string) {
    let email: string,
      firstName: string,
      lastName: string,
      picture = '';
    if (newUser.hasOwnProperty('email')) {
      email = newUser.email;
    }
    if (newUser.hasOwnProperty('picture')) {
      picture = newUser.picture;
    }
    if (
      newUser.hasOwnProperty('firstName') | newUser.hasOwnProperty('lastName')
    ) {
      lastName = `${newUser.lastName}`;
      firstName = `${newUser.firstName}`;
    }

    const user = await this.usersService.loginWithGoogle(
      email,
      firstName,
      lastName,
      picture,
    );
    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      domain,
    );
    return { user, accessToken, refreshToken };
  }

  public async logout(refreshToken: string): Promise<IMessage> {
    const { id, tokenId } = await this.jwtService.verifyToken<IRefreshToken>(
      refreshToken,
      TokenTypeEnum.REFRESH,
    );
    await this.blacklistToken(id, tokenId);
    return this.commonService.generateMessage('Logout successful');
  }

  public async resetPasswordEmail(
    dto: EmailDto,
    domain?: string,
  ): Promise<IMessage> {
    const user = await this.usersService.uncheckedUserByEmail(dto.email);

    await this.jwtService.generateToken(
      user,
      TokenTypeEnum.RESET_PASSWORD,
      domain,
    );
    this.mailerService.sendResetPasswordEmail(user, user?.otp);

    return this.commonService.generateMessage('Reset password email sent');
  }

  public async resetPassword(dto: ResetPasswordDto): Promise<IMessage> {
    const { password1, password2, otp, email } = dto;
    const user = await this.userByEmailOrUsername(email);
    this.comparePasswords(password1, password2);
    this.compareOTPs(user?.otp, otp);
    await this.usersService.resetPassword(
      user?.id,
      user.credentials.version,
      password1,
    );
    return this.commonService.generateMessage('Password reset successful');
  }

  public async resetPasswordWithPhone(
    dto: ResetPasswordWithPhoneDto,
  ): Promise<IMessage> {
    const { password1, password2, otp, callingCode, phoneNumber } = dto;
    const user = await this.userByPhoneNumber(callingCode, phoneNumber);
    this.comparePasswords(password1, password2);
    this.compareOTPs(user?.otp, otp);
    await this.usersService.resetPasswordWithPhone(
      user?.id,
      user.credentials.version,
      password1,
    );
    return this.commonService.generateMessage('Password reset successful');
  }

  public async changePassword(
    userId: number,
    dto: ChangePasswordDto,
    domain?: string,
  ): Promise<IAuthResult> {
    const { password1, password2, password } = dto;
    this.comparePasswords(password1, password2);
    const user = await this.usersService.updatePassword(
      userId,
      password,
      password1,
    );
    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      domain,
    );
    return { user, accessToken, refreshToken };
  }

  private async checkLastPassword(
    credentials: ICredentials,
    password: string,
  ): Promise<void> {
    const { lastPassword, passwordUpdatedAt } = credentials;

    if (lastPassword.length === 0 || !(await compare(password, lastPassword))) {
      throw new UnauthorizedException(['Invalid credentials']);
    }

    const now = dayjs();
    const time = dayjs.unix(passwordUpdatedAt);
    const months = now.diff(time, 'month');
    const message = 'You changed your password ';

    if (months > 0) {
      throw new UnauthorizedException([
        message + months + (months > 1 ? ' months ago' : ' month ago'),
      ]);
    }

    const days = now.diff(time, 'day');

    if (days > 0) {
      throw new UnauthorizedException([
        message + days + (days > 1 ? ' days ago' : ' day ago'),
      ]);
    }

    const hours = now.diff(time, 'hour');

    if (hours > 0) {
      throw new UnauthorizedException([
        message + hours + (hours > 1 ? ' hours ago' : ' hour ago'),
      ]);
    }

    throw new UnauthorizedException([message + 'recently']);
  }

  private async checkIfTokenIsBlacklisted(
    userId: number,
    tokenId: string,
  ): Promise<void> {
    const count = await this.blacklistedTokensRepository.countBy({
      user: userId,
      tokenId,
    });

    if (count > 0) {
      throw new UnauthorizedException(['Token is invalid']);
    }
  }

  private async blacklistToken(userId: number, tokenId: string): Promise<void> {
    const blacklistedToken = this.blacklistedTokensRepository.create({
      user: userId,
      tokenId,
    });
    await this.blacklistedTokensRepository.insert(blacklistedToken);
  }

  private comparePasswords(password1: string, password2: string): void {
    if (password1 !== password2) {
      throw new BadRequestException(['Passwords do not match']);
    }
  }

  private compareOTPs(otp: number, otp2: number): void {
    if (otp !== otp2) {
      throw new BadRequestException(['Worng OTP']);
    }
  }

  private async userByEmailOrUsername(emailOrUsername: string): Promise<Users> {
    if (emailOrUsername.includes('@')) {
      if (!isEmail(emailOrUsername)) {
        throw new BadRequestException(['Invalid email']);
      }

      return this.usersService.findOneByEmail(emailOrUsername);
    }

    if (
      emailOrUsername.length < 3 ||
      emailOrUsername.length > 106 ||
      !SLUG_REGEX.test(emailOrUsername)
    ) {
      throw new BadRequestException(['Invalid username']);
    }

    return this.usersService.findOneByUsername(emailOrUsername, true);
  }

  private async userByPhoneNumber(
    callingCode: string,
    phoneNumber: string,
  ): Promise<Users> {
    return this.usersService.findOneByPhoneNumber(callingCode, phoneNumber);
  }

  private async sendOtpPhoneWithRetry(
    callingCode: string,
    phoneNumber: string,
    otp: number,
    maxRetries = 3,
    retryDelay = 1000, // 1 second delay between retries
  ): Promise<void> {
    const isLive = process.env.NODE_ENV;
    if (isLive == 'development') return;
    let retryCount = 0;

    const sendRequest = async () => {
      const message = `Your Halla verification code is: ${otp}. This code will expire in 10 minutes. Don't share this code with anyone; our employees will never ask for the code.`;

      const data = JSON.stringify({
        src: 'halla',
        dests: [`${callingCode}${phoneNumber}`],
        body: message,
        priority: 0,
        delay: 0,
        validity: 10,
        maxParts: 0,
        dlr: 0,
        prevDups: 0,
        msgClass: 'transactional',
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.OUR_SMS_BASE_URL}/msgs/sms`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OUR_SMS_API_KEY}`,
        },
        data: data,
      };
      console.log('🚀 ~ AuthService ~ sendRequest ~ config:', config);

      try {
        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser
          // and an instance of http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`Retrying (${retryCount}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay)); // wait for retryDelay milliseconds before retrying
          await sendRequest();
        } else {
          console.error(`Max retries exceeded. Failed to send OTP via SMS.`);
          // throw new Error('Failed to send OTP via SMS.');
        }
      }
    };

    await sendRequest();
  }

  public async updatePassword(
    userId: number,
    dto: ChangePasswordDto,
    domain?: string,
  ): Promise<IAuthResult> {
    const { password1, password2, password } = dto;
    this.comparePasswords(password1, password2);
    const user = await this.usersService.updatePassword(
      userId,
      password,
      password1,
    );
    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      domain,
    );
    return { user, accessToken, refreshToken };
  }

  private async generateAuthTokens(
    user: Users,
    domain?: string,
    tokenId?: string,
  ): Promise<[string, string]> {
    return Promise.all([
      this.jwtService.generateToken(
        user,
        TokenTypeEnum.ACCESS,
        domain,
        tokenId,
      ),
      this.jwtService.generateToken(
        user,
        TokenTypeEnum.REFRESH,
        domain,
        tokenId,
      ),
    ]);
  }
}
