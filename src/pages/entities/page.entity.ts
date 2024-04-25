// Import necessary modules from TypeORM
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'pages' })
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  // HTML content of the page; defined in text so it can hold big data
  @Column({ type: 'text' })
  content: string;

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
