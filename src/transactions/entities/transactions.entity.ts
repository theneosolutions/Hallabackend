

import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsOptional, IsString} from 'class-validator';
import { ITransactions } from '../interfaces/transactions.interface';
import { Users } from 'src/users/entities/user.entity';

export type TransactionsStatus = "Initiated" | "Paid" | "Failed";

@Entity()
export class Transactions implements ITransactions {
  @PrimaryGeneratedColumn()
  public id: number;

  @IsString()
  @Column('varchar')
  public amount: string;

  @IsString()
  @Column('varchar')
  public description: string;

  @IsOptional()
  @IsString()
  @Column({
    type: 'enum',
    enum: ["Initiated", "Paid", "Failed"],
    default: "Initiated"
  })
  public status: TransactionsStatus;

  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', default: null, nullable: true })
  public paymentId: string;

  @ManyToOne(() => Users, (user) => user.id)
  public user: number;

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
