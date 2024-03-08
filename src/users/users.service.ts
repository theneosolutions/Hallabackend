
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { ChangeEmailDto } from './dtos/change-email.dto';
import { UsernameDto } from './dtos/username.dto';
import { Users } from './entities/user.entity';
import { PasswordDto } from './dtos/password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { isInt } from 'class-validator';
import { SLUG_REGEX } from '../common/consts/regex.const';
import { APPLE_LOGIN, DISCORD_LOGIN, FACEBOOK_LOGIN, GOOGLE_LOGIN } from 'src/common/consts/login.const';
import { default as disposeAbleDomain } from './../data/domains.json'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly commonService: CommonService,
  ) { }

  public async create(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    referredBy?: string
  ): Promise<Users> {
    const formattedEmail = email.toLowerCase();
    await this.checkEmailUniqueness(formattedEmail);
    const formattedFirstName = this.commonService.formatName(firstName);
    const formattedLastName = this.commonService.formatName(lastName);
    console.log("🚀 ~ file: users.service.ts:54 ~ UsersService ~ user:", {
      email: formattedEmail,
      firstName: formattedFirstName,
      lastName: formattedLastName,
      username: await this.generateUsername(`${formattedFirstName} ${formattedLastName}`),
      password: await hash(password, 10),
      profilePhoto: "https://res.cloudinary.com/dogufahvv/image/upload/default.jpg", //default placeholder image
      referenceCode: Math.random().toString(36).slice(2).slice(0, 5).toUpperCase(),
      referredBy: referredBy
    })

    const user = this.usersRepository.create({
      email: formattedEmail,
      firstName: formattedFirstName,
      lastName: formattedLastName,
      username: await this.generateUsername(`${formattedFirstName} ${formattedLastName}`),
      password: await hash(password, 10),
      otp: Math.floor(1000 + Math.random() * 9000),
      profilePhoto: "https://res.cloudinary.com/dogufahvv/image/upload/default.jpg", //default placeholder image
      referenceCode: Math.random().toString(36).slice(2).slice(0, 5).toUpperCase(),
      referredBy: referredBy
    });
    await this.usersRepository.insert(user);
    return user;
  }

  public async createUserWithPhone(
    callingCode: string,
    phoneNumber: string
  ): Promise<Users> {
    const formattedPhone = phoneNumber.toLowerCase();
    await this.checkPhoneUniqueness(callingCode, formattedPhone);
    const formattedFirstName = this.commonService.formatName('anonymous');
    const formattedLastName = this.commonService.formatName('user');

    const user = this.usersRepository.create({
      email: null,
      callingCode: callingCode,
      phoneNumber: formattedPhone,
      firstName: formattedFirstName,
      lastName: formattedLastName,
      username: await this.generateUsername(`${formattedFirstName} ${formattedLastName}`),
      otp: Math.floor(1000 + Math.random() * 9000),
      profilePhoto: "https://res.cloudinary.com/dogufahvv/image/upload/default.jpg", //default placeholder image
      referenceCode: Math.random().toString(36).slice(2).slice(0, 5).toUpperCase()
    });
    await this.usersRepository.insert(user);
    return user;
  }

  public async loginWithGoogle(
    email: string,
    firstName: string,
    lastName: string,
    profilePhoto: string,
  ): Promise<Users> {
    const formattedEmail = email.toLowerCase();
    await this.checkIsCompanyEmail(formattedEmail);
    const formattedFirstName = this.commonService.formatName(firstName);
    const formattedLastName = this.commonService.formatName(lastName);
    const user = await this.findOneByEmail(formattedEmail);
    if (isUndefined(user) || isNull(user)) {
      const user = this.usersRepository.create({
        email: formattedEmail,
        firstName: formattedFirstName,
        lastName: formattedLastName,
        username: await this.generateUsername(`${firstName} ${lastName}`),
        loginType: GOOGLE_LOGIN,
        profilePhoto: profilePhoto,
        confirmed: true,
        referenceCode: Math.random().toString(36).slice(2).toUpperCase()
      });
      await this.usersRepository.insert(user);
      return user;
    } else {
      return user;
    }


  }

  public async findOneById(id: number): Promise<Users> {
    const user = await this.usersRepository.findOneBy({ id: id });
    this.commonService.checkEntityExistence(user, 'User');
    return user;
  }

  public async findOneByUsername(
    username: string,
    forAuth = false,
  ): Promise<Users> {
    const user = await this.usersRepository.findOneBy({ username: username.toLowerCase() });
    if (forAuth) {
      this.throwUnauthorizedException(user);
    } else {
      this.commonService.checkEntityExistence(user, 'User');
    }

    return user;
  }

  public async findOneByPhoneNumber(
    callingCode: string,
    phoneNumber: string,
  ): Promise<Users> {
    const user = await this.usersRepository.findOneBy({ callingCode: callingCode, phoneNumber: phoneNumber.toLowerCase() });
    this.commonService.checkEntityExistence(user, 'User');
    return user;
  }

  public async findOneByIdOrUsername(
    idOrUsername: string,
  ): Promise<Users> {
    const parsedValue = parseInt(idOrUsername, 10);

    if (!isNaN(parsedValue) && parsedValue > 0 && isInt(parsedValue)) {
      return this.findOneById(parsedValue);
    }

    if (
      idOrUsername.length < 3 ||
      idOrUsername.length > 106 ||
      !SLUG_REGEX.test(idOrUsername)
    ) {
      throw new BadRequestException('Invalid username');
    }

    return this.findOneByUsername(idOrUsername);
  }

  public async findOneByEmail(email: string): Promise<Users> {
    const user = await this.usersRepository.findOneBy({ email: email.toLowerCase() });
    return user;
  }

  // necessary for password reset
  public async uncheckedUserByEmail(email: string): Promise<Users> {
    return this.usersRepository.findOneBy({
      email: email.toLowerCase(),
    });
  }

  public async findOneByCredentials(
    id: number,
    version: number,
  ): Promise<Users> {
    console.log("🚀 ~ file: users.service.ts:112 ~ UsersService ~ version:", version)
    const user = await this.usersRepository.findOneBy({ id: id });
    console.log("🚀 ~ file: users.service.ts:113 ~ UsersService ~ user:", user.credentials.version)
    this.throwUnauthorizedException(user);

    if (user.credentials.version !== version) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  public async confirmEmail(
    userId: number,
    version: number,
  ): Promise<Users> {
    const user = await this.findOneByCredentials(userId, version);

    if (user.confirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    user.confirmed = true;
    user.credentials.updateVersion();
    await this.usersRepository.update(userId, user);
    return user;
  }

  public async updateUsername(
    userId: number,
    dto: UsernameDto,
  ): Promise<Users> {
    const user = await this.findOneById(userId);
    const formattedUsername = dto.username.toLowerCase();
    await this.checkUsernameUniqueness(formattedUsername);
    user.username = formattedUsername;
    // await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async update(userId: number, dto: any): Promise<Users> {
    const user = await this.findOneById(userId);
    return await this.usersRepository.save({
      ...user, // existing fields
      ...dto // updated fields
    });
  }



  public async updatePassword(
    userId: number,
    password: string,
    newPassword: string,
  ): Promise<Users> {
    const user = await this.findOneById(userId);

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Wrong password');
    }
    if (await compare(newPassword, user.password)) {
      throw new BadRequestException('New password must be different');
    }

    user.credentials.updatePassword(user.password);
    user.password = await hash(newPassword, 10);
    await this.usersRepository.update(userId, user);
    return user;
  }

  public async resetPassword(
    userId: number,
    version: number,
    password: string,
  ): Promise<Users> {
    const user = await this.findOneByCredentials(userId, version);
    user.credentials.updatePassword(user.password);
    user.password = await hash(password, 10);
    await this.usersRepository.update(userId, user);
    return user;
  }

  public async resetPasswordWithPhone(
    userId: number,
    version: number,
    password: string,
  ): Promise<Users> {
    const user = await this.findOneByCredentials(userId, version);
    user.credentials.updatePassword(user.password);
    user.password = await hash(password, 10);
    user.otp = Math.floor(1000 + Math.random() * 9000);
    await this.usersRepository.update(userId, user);
    return user;
  }

  public async updateEmail(
    userId: number,
    dto: ChangeEmailDto,
  ): Promise<Users> {
    const user = await this.findOneById(userId);
    const { email, password } = dto;

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Wrong password');
    }

    const formattedEmail = email.toLowerCase();
    await this.checkEmailUniqueness(formattedEmail);
    user.email = formattedEmail;
    await this.usersRepository.update(userId, user);
    return user;
  }

  public async updateUserOTP(
    userId: number,
  ): Promise<Users> {
    const user = await this.findOneById(userId);
    user.otp = Math.floor(1000 + Math.random() * 9000);
    await this.usersRepository.update(userId, user);
    return user;
  }

  public async delete(userId: number, dto: PasswordDto): Promise<Users> {
    const user = await this.findOneById(userId);

    if (!(await compare(dto.password, user.password))) {
      throw new BadRequestException('Wrong password');
    }

    const deleteResponse = await this.usersRepository.softDelete(user.id);
    if (!deleteResponse.affected) {
      throw new BadRequestException('Error while deleting user. Please try again');
    }

    return user;
  }



  private async checkUsernameUniqueness(username: string): Promise<void> {
    const count = await this.usersRepository.countBy({ username });

    if (count > 0) {
      throw new ConflictException(['Username already in use']);
    }
  }

  private async checkPhoneUniqueness(callingCode: string, phoneNumber: string): Promise<void> {
    const count = await this.usersRepository.countBy({ callingCode, phoneNumber });

    if (count > 0) {
      throw new ConflictException(['Phone number already in use']);
    }
  }


  private throwUnauthorizedException(
    user: undefined | null | Users,
  ): void {
    if (isUndefined(user) || isNull(user)) {
      throw new UnauthorizedException(['Invalid credentials']);
    }
  }

  private async checkEmailUniqueness(email: string): Promise<void> {
    const count = await this.usersRepository.countBy({ email });

    if (count > 0) {
      throw new ConflictException(['Email already in use']);
    }


  }

  private async checkIsCompanyEmail(email: string): Promise<void> {
    const broken = email.split('@')
    const domain = `${broken[broken.length - 1]}`;

    console.log("🚀 ~ file: users.service.ts:397 ~ UsersService ~ checkIsCompanyEmail ~ disposeAbleDomain:", disposeAbleDomain)
    if (disposeAbleDomain.includes(domain)) {
      throw new ConflictException(["We don't accept personal emails. Please enter a work email."]);
    }


  }

  /**
   * Generate Username
   *
   * Generates a unique username using a point slug based on the name
   * and if it's already in use, it adds the usernames count to the end
   */
  private async generateUsername(name: string): Promise<string> {
    const pointSlug = this.commonService.generatePointSlug(name);
    const count = await this.usersRepository.countBy({
      username: Like(`${pointSlug}%`)
    });

    if (count > 0) {
      return `${pointSlug}${count}`;
    }

    return pointSlug;
  }
}
