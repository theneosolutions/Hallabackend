import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Events } from './event.entity';
import { Contacts } from 'src/contacts/entities/contacts.entity';

@Entity()
export class EventsChats {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 255 })
  action: string;

  @Column({ length: 1024, nullable: true })
  actionData: string;

  @Column({ length: 50, nullable: true })
  actionType: string;

  @Column({ type: 'varchar', default: '', nullable: true })
  public mediaURL: string;

  @Column({ type: 'varchar', default: '', nullable: true })
  public mediaCaption: string;

  @Column({ type: 'boolean', default: false })
  public isRead: true | false = false;

  @Column({ type: 'text', nullable: true })
  additionalInfo: string;

  @Column({ type: 'int', nullable: true })
  sentBy: number;

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => `now()`, nullable: false })
  public updatedAt: Date;

  @ManyToOne(() => Users, (user) => user.eventsChats)
  actionUser: Users;

  @ManyToOne(() => Contacts, (contact) => contact.eventsChats)
  contact: Contacts;

  @ManyToOne(() => Events, (events) => events.eventschats)
  event: Events;
}
