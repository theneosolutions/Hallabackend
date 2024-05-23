import { faker } from '@faker-js/faker';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { isJWT, isUUID } from 'class-validator';
import { CommonModule } from '../../common/common.module';
import { CommonService } from '../../common/common.service';
import { config } from '../../config';
import { validationSchema } from '../../config/config.schema';
import { MikroOrmConfig } from '../../config/mikroorm.config';
import { TokenTypeEnum } from '../../jwt/enums/token-type.enum';
import { IRefreshToken } from '../../jwt/interfaces/refresh-token.interface';
import { JwtModule } from '../../jwt/jwt.module';
import { JwtService } from '../../jwt/jwt.service';

import { UserEntity } from '../../users/entities/user.entity';
import { IUser } from '../../users/interfaces/user.interface';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { BlacklistedTokenEntity } from '../entities/blacklisted-token.entity';

import { compare, hash } from 'bcrypt';

describe('AuthService', () => {
  let module: TestingModule,
    authService: AuthService,
    usersService: UsersService,
    jwtService: JwtService,
    commonService: CommonService,
    // cacheManager: Cache,
    orm: MikroORM;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema,
          load: [config],
        }),
        MikroOrmModule.forRootAsync({
          imports: [ConfigModule],
          useClass: MikroOrmConfig,
        }),
        CommonModule,
        UsersModule,
        JwtModule,
        MikroOrmModule.forFeature([BlacklistedTokenEntity]),
      ],
      providers: [AuthService, CommonModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    commonService = module.get<CommonService>(CommonService);
    // cacheManager = module.get<Cache>(CACHE_MANAGER);
    orm = module.get<MikroORM>(MikroORM);
    await orm.getSchemaGenerator().createSchema();
  });

  const name = faker.name.firstName();
  const email = faker.internet.email().toLowerCase();
  const password = faker.internet.password(10);
  const baseUser = {
    id: 1,
    email,
    credentials: {
      version: 0,
    },
  } as IUser;

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(commonService).toBeDefined();
    // expect(cacheManager).toBeDefined();
    expect(orm).toBeDefined();
  });

  describe('sign up', () => {
    it('should create a new user', async () => {
      const message = await authService.signUp({
        name,
        email,
        password1: password,
        password2: password,
      });
      expect(message.message).toStrictEqual('Registration successful');
      expect(isUUID(message.id)).toBe(true);
    });

    it('should throw an error if the passwords do not match', async () => {
      const password = faker.internet.password(10);
      await expect(
        authService.signUp({
          name: faker.name.firstName(),
          email: faker.internet.email(),
          password1: password,
          password2: password + '1',
        }),
      ).rejects.toThrowError('Passwords do not match');
    });
  });

  describe('sign in', () => {
    it('should sign in an user by email', async () => {
      const result = await authService.signIn({
        emailOrUsername: email,
        password,
      });
      expect(result.user).toBeInstanceOf(UserEntity);
      expect(result.accessToken).toBeDefined();
      expect(isJWT(result.accessToken)).toBe(true);
      expect(result.refreshToken).toBeDefined();
      expect(isJWT(result.refreshToken)).toBe(true);
    });

    it('should sign in an user by username', async () => {
      const result = await authService.signIn({
        emailOrUsername: commonService.generatePointSlug(name),
        password,
      });
      expect(result.user).toBeInstanceOf(UserEntity);
      expect(result.accessToken).toBeDefined();
      expect(isJWT(result.accessToken)).toBe(true);
      expect(result.refreshToken).toBeDefined();
      expect(isJWT(result.refreshToken)).toBe(true);
    });

    it('should throw an unauthorized exception if the password is wrong', async () => {
      await expect(
        authService.signIn({
          emailOrUsername: email,
          password: password + '1',
        }),
      ).rejects.toThrowError('Invalid credentials');
    });

    it('should throw an unauthorized exception if email or username is wrong', async () => {
      await expect(
        authService.signIn({
          emailOrUsername: faker.internet.email(),
          password,
        }),
      ).rejects.toThrowError('Invalid credentials');
    });

    it('should throw a bad request exception if the email is malformed', async () => {
      await expect(
        authService.signIn({
          emailOrUsername: faker.internet.email() + '&',
          password,
        }),
      ).rejects.toThrowError('Invalid email');
    });

    it('should throw a bad request exception if the username is malformed', async () => {
      await expect(
        authService.signIn({
          emailOrUsername: 'username&',
          password,
        }),
      ).rejects.toThrowError('Invalid username');
    });
  });

  describe('refresh token', () => {
    let token: string;

    it('should create a refresh token', async () => {
      token = await jwtService.generateToken(
        {
          ...baseUser,
          credentials: {
            ...baseUser.credentials,
            version: 1,
          },
        },
        TokenTypeEnum.REFRESH,
      );
      expect(token).toBeDefined();
      expect(isJWT(token)).toBe(true);
    });

    it('should refresh the token', async () => {
      const result = await authService.refreshTokenAccess(token);
      expect(result.accessToken).toBeDefined();
      expect(isJWT(result.accessToken)).toBe(true);
      expect(result.refreshToken).toBeDefined();
      expect(isJWT(result.refreshToken)).toBe(true);
    });

    it('should throw an error if the token is invalid', async () => {
      await expect(
        authService.refreshTokenAccess(token + '1'),
      ).rejects.toThrowError('Invalid token');
    });
  });

  describe('logout', () => {
    it('should blacklist the token', async () => {
      const token = await jwtService.generateToken(
        baseUser,
        TokenTypeEnum.REFRESH,
      );
      const { id, tokenId } = await jwtService.verifyToken<IRefreshToken>(
        token,
        TokenTypeEnum.REFRESH,
      );

      const message = await authService.logout(token);
      expect(message.message).toStrictEqual('Logout successful');
      expect(isUUID(message.id)).toBe(true);

      await expect(authService.refreshTokenAccess(token)).rejects.toThrowError(
        'Token is invalid',
      );
    });
  });

  const newPassword = faker.internet.password();
  describe('reset password', () => {
    let token: string;

    it('should create a reset password token', async () => {
      token = await jwtService.generateToken(
        {
          ...baseUser,
          credentials: {
            ...baseUser.credentials,
            version: 1,
          },
        },
        TokenTypeEnum.RESET_PASSWORD,
      );
      expect(token).toBeDefined();
      expect(isJWT(token)).toBe(true);
    });

    it('should throw an error if the passwords do not match', async () => {
      await expect(
        authService.resetPassword({
          resetToken: token,
          password1: newPassword,
          password2: newPassword + '1',
        }),
      ).rejects.toThrowError('Passwords do not match');
    });

    it('should reset the password', async () => {
      const message = await authService.resetPassword({
        resetToken: token,
        password1: newPassword,
        password2: newPassword,
      });
      expect(message.message).toStrictEqual('Password reset successful');
      expect(isUUID(message.id)).toBe(true);
    });

    it('should throw an error if the token is invalid', async () => {
      await expect(
        authService.resetPassword({
          resetToken: token + '1',
          password1: newPassword,
          password2: newPassword,
        }),
      ).rejects.toThrowError('Invalid token');
    });

    it('should throw an unauthorized exception if token has been used', async () => {
      await expect(
        authService.resetPassword({
          resetToken: token,
          password1: newPassword,
          password2: newPassword,
        }),
      ).rejects.toThrowError('Invalid credentials');
    });

    it('old password should not work', async () => {
      console.log(
        '🚀 ~ file: auth.service.spec.ts:295 ~ it ~ password',
        password,
      );

      await expect(
        authService.signIn({
          emailOrUsername: email,
          password,
        }),
      ).rejects.toThrowError('You changed your password recently');
    });
  });

  const newPassword2 = faker.internet.password();
  describe('change password', () => {
    it('should throw an error if the passwords do not match', async () => {
      await expect(
        authService.changePassword(1, {
          password1: newPassword2,
          password2: newPassword2 + '1',
          password: newPassword,
        }),
      ).rejects.toThrowError('Passwords do not match');
    });

    it('should throw an error if the old password is incorrect', async () => {
      await expect(
        authService.changePassword(1, {
          password1: newPassword2,
          password2: newPassword2,
          password: newPassword + '1',
        }),
      ).rejects.toThrowError('Wrong password');
    });

    it('should throw an error if password is the same as the old password', async () => {
      await expect(
        authService.changePassword(1, {
          password1: newPassword,
          password2: newPassword,
          password: newPassword,
        }),
      ).rejects.toThrowError('New password must be different');
    });

    it('should change the password', async () => {
      const result = await authService.changePassword(1, {
        password1: newPassword2,
        password2: newPassword2,
        password: newPassword,
      });
      expect(result.user).toBeInstanceOf(UserEntity);
      expect(result.accessToken).toBeDefined();
      expect(isJWT(result.accessToken)).toBe(true);
      expect(result.refreshToken).toBeDefined();
      expect(isJWT(result.refreshToken)).toBe(true);
    });

    it('old password should not work', async () => {
      await expect(
        authService.signIn({
          emailOrUsername: email,
          password: newPassword,
        }),
      ).rejects.toThrowError('You changed your password recently');
    });
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close(true);
    await module.close();
  });
});
