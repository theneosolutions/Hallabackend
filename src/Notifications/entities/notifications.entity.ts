import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { IsOptional, IsString } from 'class-validator';
import { INotifications } from '../interfaces/notifications.interface';
import { Users } from '../../users/entities/user.entity';

@Entity()
export class Notifications implements INotifications {
  @PrimaryGeneratedColumn()
  public id: number;

  @IsString()
  @Column({ type: 'varchar', default: 'active', nullable: false })
  public content: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'boolean', default: false })
  public status: boolean;

  @IsOptional()
  @IsString()
  @Column({ type: 'bigint', default: false, nullable: true })
  public resourceId: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'bigint', default: null, nullable: true })
  public parent: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: null, nullable: true })
  public resourceType: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: null, nullable: true })
  public parentType: string;

  @ManyToOne(() => Users, (user) => user.id)
  public user: number;

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
