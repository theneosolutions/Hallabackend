import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';
import { IPackages } from '../interfaces/packages.interface';

@Entity()
export class Packages implements IPackages {
  @PrimaryGeneratedColumn()
  public id: number;

  @IsString()
  @Length(3, 220)
  @Matches(NAME_REGEX, {
    message: 'Package name must not have special characters',
  })
  @Column('varchar')
  public name: string;

  @IsString()
  @Length(3, 230)
  @Column('varchar')
  public subHeading: string;

  @IsNumber()
  @Length(3, 100)
  @Column('float')
  public price: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'int', default: 0 })
  public numberOfGuest: number;

  @IsString()
  @Column({ type: 'varchar', default: 'active', nullable: false })
  public status: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: null, nullable: true })
  public notes: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', default: null, nullable: true, length: 5000 })
  public description: string;

  @Column({ default: () => `now()`, nullable: false })
  public createdAt: Date;

  @Column({ default: () => 'now()', nullable: false })
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
