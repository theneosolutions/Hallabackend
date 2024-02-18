

import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';
import {
  BCRYPT_HASH,
  NAME_REGEX,
  SLUG_REGEX,
} from '../../common/consts/regex.const';
import { CredentialsEmbeddable } from '../embeddables/credentials.embeddable';
import { IUser } from '../interfaces/user.interface';
import { MANUAL_LOGIN } from '../../common/consts/login.const';

export type UserStatus = "active" | "disabled";

export type UserRole = "admin" | "moderator" | "user";

@Entity()
export class Users implements IUser {
  @PrimaryGeneratedColumn()
  public id: number;

  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'First name must not have special characters',
  })
  @Column('varchar')
  public firstName: string;

  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Last name must not have special characters',
  })
  @Column('varchar')
  public lastName: string;

  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  @Column('varchar')
  public username: string;

  @IsOptional()
  @IsString()
  @Column('varchar')
  public loginType: string = MANUAL_LOGIN;

  @IsString()
  @Column('varchar')
  public profilePhoto;

  @IsOptional()
  @IsString()
  @Column({
    type: 'enum',
    enum: ["admin", "moderator", "user"],
    default: "user"
  })
  public roles: UserRole

  @IsOptional()
  @IsString()
  @Column({
    type: 'enum',
    enum: ["active", "disabled"],
    default: "active"
  })
  public status: UserStatus;

  @IsString()
  @IsEmail()
  @Length(5, 255)
  @Column({ type: 'varchar', default: null, nullable: true })
  public email: string;

  @IsString()
  @Length(59, 60)
  @Matches(BCRYPT_HASH)
  @Column({ type: 'varchar', default: null, nullable: true })
  public password: string;

  @IsBoolean()
  @Column('boolean')
  public confirmed: true | false = false;

  @IsString()
  @Length(2, 5)
  @IsOptional()
  @Column({ type: 'varchar', default: null, nullable: true })
  public callingCode: string;

  @IsString()
  @Length(5, 255)
  @IsOptional()
  @Column({ type: 'varchar', default: null, nullable: true })
  public phoneNumber: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'int' })
  public otp: number;

  @IsBoolean()
  @Column('boolean')
  public isPhoneVerified: true | false = false;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  public isBanned: true | false = false;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: null, nullable: true })
  public referredBy: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: null, nullable: true })
  public referenceCode: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', default: null, nullable: true })
  public deviceToken: string;

  @Column(() => CredentialsEmbeddable, { prefix: false })
  public credentials: CredentialsEmbeddable;

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
