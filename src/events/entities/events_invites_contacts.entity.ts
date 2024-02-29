
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn, OneToMany, JoinTable, ManyToMany, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Users } from '../../users/entities/user.entity';
import { Events } from './event.entity';
import { v4 as uuidV4, v5 as uuidV5 } from 'uuid';

@Entity()
export class EventInvitessContacts{

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: 'invited' })
  public status: string;

  @IsOptional()
  @IsNumber()
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0, nullable: true })
  public numberOfScans: number;


  @IsOptional()
  @IsNumber()
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0, nullable: true })
  public numberOfGuests: number;

  @PrimaryColumn({ type: "int" })
  usersId: number;

  @PrimaryColumn({ type: "int" })
  eventId: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: uuidV4() })
  public code: string;


  @IsOptional()
  @IsString()
  @Column({ type: 'text', default: "email" })
  public notes: string;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  public haveChat: true | false = false;

  @ManyToOne(
    () => Users,
    users => users.events,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
  )
  @JoinColumn([{ name: 'usersId', referencedColumnName: 'id' }])
  invites: Users[];

  @ManyToOne(
    () => Events,
    events => events.invites,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
  )
  @JoinColumn([{ name: 'eventId', referencedColumnName: 'id' }])
  events: Events[];

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;


}
