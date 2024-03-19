
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn, OneToMany, JoinTable, ManyToMany, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Users } from '../../users/entities/user.entity';
import { Events } from './event.entity';
import { v4 as uuidV4, v5 as uuidV5 } from 'uuid';
import { Contacts } from 'src/contacts/entities/contacts.entity';

@Entity()
export class EventInvitessContacts{

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: 'pending' })
  public status: string;

  @IsOptional()
  @IsNumber()
  @Column({ type: 'int', default: 0, nullable: true })
  public numberOfScans: number;


  @IsOptional()
  @IsNumber()
  @Column({ type: 'int', default: 0, nullable: true })
  public numberOfGuests: number;

  @Column({ type: "int" , nullable: true,default:0})
  usersId: number;

  @PrimaryColumn({ type: "int" })
  eventId: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: uuidV4() })
  public code: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: '' })
  public notes: string;

  @IsOptional()
  @IsBoolean()
  @Column({type:'boolean', default: false})
  public haveChat: true | false = false;

  @IsOptional()
  @IsBoolean()
  @Column({type:'boolean', default: false})
  public selectedEvent: true | false = false;

  @IsOptional()
  @IsBoolean()
  @Column({type:'boolean', default: false})
  public sendList: true | false = false;

  @ManyToOne(
    () => Contacts,
    contacts => contacts.events,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
  )
  @JoinColumn([{ name: 'contactsId', referencedColumnName: 'id' }])
  invites: Contacts[];

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
