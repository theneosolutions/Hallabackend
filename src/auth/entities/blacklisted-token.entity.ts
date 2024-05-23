import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { IBlacklistedToken } from '../interfaces/blacklisted-token.interface';

@Entity()
export class BlacklistedToken implements IBlacklistedToken {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar')
  public tokenId: string;

  @ManyToOne(() => Users, (user) => user.id)
  public user: number;

  @Column({ name: 'created_at', default: () => `now()`, nullable: false })
  createdAt: Date;
}
