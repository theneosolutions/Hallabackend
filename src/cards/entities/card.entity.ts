import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ICard } from '../interfaces/card.interface';
import { Events } from '../../events/entities/event.entity';

@Entity()
export class Card implements ICard {
  @PrimaryGeneratedColumn()
  public id: number;

  @IsString()
  @Column({ type: 'varchar', default: 'active', nullable: false })
  public name: string;

  @IsString()
  @Column({ type: 'varchar', nullable: true })
  public type: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: 'draft' })
  public status: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true, length: 4000 })
  public notes: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public file: string;

  @IsString()
  @Column({ type: 'varchar', nullable: true, length: 1024 })
  public image: string;

  @ManyToMany(() => Events, (events) => events.card)
  events: Events[];

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
