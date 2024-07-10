import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { IEvent } from '../interfaces/event.interface';
import { Contacts } from '../../contacts/entities/contacts.entity';
import { v4 as uuidV4, v5 as uuidV5 } from 'uuid';
import { Users } from 'src/users/entities/user.entity';
import { Card } from 'src/cards/entities/card.entity';
import { EventsChats } from './events_chats.entity';

@Entity()
export class Events implements IEvent {
  @PrimaryGeneratedColumn()
  public id: number;

  @IsString()
  @Column({ type: 'varchar', default: 'active', nullable: false })
  public name: string;

  @IsString()
  @Column({ type: 'varchar', default: '', nullable: true })
  public image: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: 'draft' })
  public status: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: '', nullable: true })
  public notes: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: '', nullable: true })
  public eventDate: string;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  public showQRCode: true | false = false;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: '', nullable: true })
  public nearby: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: '', nullable: true })
  public address: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  public latitude: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  public longitude: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: uuidV4() })
  public code: string;

  @ManyToOne(() => Users, (user) => user.id)
  public user: number;

  @ManyToMany(() => Contacts, (contacts) => contacts.events, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  invites?: Contacts[];

  @OneToMany(() => EventsChats, (eventschats) => eventschats.event)
  eventschats: EventsChats[];

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
