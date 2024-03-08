

import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';
import { IContacts } from '../interfaces/contacts.interface';
import { v4 as uuidV4 } from 'uuid';
import { Users } from 'src/users/entities/user.entity';
import { Events } from 'src/events/entities/event.entity';

export type ContactsStatus = "active" | "disabled";


@Entity()
export class Contacts implements IContacts {
  @PrimaryGeneratedColumn()
  public id: number;

  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  @Column('varchar')
  public name: string;

  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'suffix must not have special characters',
  })
  @Column('varchar')
  public suffix: string;

  @IsOptional()
  @IsString()
  @Column({
    type: 'enum',
    enum: ["active", "disabled"],
    default: "active"
  })
  public status: ContactsStatus;

  @IsString()
  @IsEmail()
  @Length(5, 255)
  @IsOptional()
  @Column({ type: 'varchar', default: null, nullable: true })
  public email: string;

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
  @Column({ type: 'varchar', default: uuidV4() })
  public code: string;

  @ManyToOne(() => Users, (user) => user.id)
  public user: number;

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  @ManyToMany(
    () => Events,
    event => event.invites, //optional
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinTable({
    name: 'event_invitess_contacts',
    joinColumn: {
      name: 'contactsId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'eventId',
      referencedColumnName: 'id',
    },
  })
  events?: Events[];
}
