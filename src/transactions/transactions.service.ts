
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Transactions } from './entities/transactions.entity';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { isInt } from 'class-validator';
import { SLUG_REGEX } from '../common/consts/regex.const';
import { TransactionDto } from './dtos/create-transaction';
import { UsersService } from 'src/users/users.service';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { IMessage } from 'src/common/interfaces/message.interface';


@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionssRepository: Repository<Transactions>,
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) { }

  public async create(origin: string | undefined, dto: TransactionDto): Promise<Transactions> {
    const { user: userId, amount, description, paymentId } = dto;

    if (isNaN(userId) || isNull(userId) || isUndefined(userId)) {
      throw new BadRequestException(['User cannot be null']);
    }

    const userDetail = await this.usersService.findOneById(userId);

    if (isNull(userDetail) || isUndefined(userDetail)) {
      throw new BadRequestException(['User not found with id: ' + userId]);
    }

    if (isNull(amount) || isUndefined(amount)) {
      throw new BadRequestException(['amount cannot be null']);
    }

    if (isNull(description) || isUndefined(description)) {
      throw new BadRequestException(['description cannot be null']);
    }

    if (isNull(paymentId) || isUndefined(paymentId)) {
      throw new BadRequestException(['paymentId cannot be null']);
    }

    const transaction = this.transactionssRepository.create({
      amount: amount,
      description: description,
      paymentId: paymentId,
      status: 'Initiated',
      user: userId,
    });
    await this.transactionssRepository.insert(transaction);
    return transaction;
  }

  public async findOneByWhere(
    where: any,
  ): Promise<Transactions[]> {
    const contactsItems = await this.transactionssRepository.findBy(where)
    return contactsItems;
  }

  public async updateUserTransactionStatus(id: string, status: string, amount: number, currency: string): Promise<Transactions> {
    const finalAmount = +(amount/100).toFixed(2);
    try {
      const transaction = await this.findTransactionByPaymentId(id);
      console.log("🚀 ~ TransactionsService ~ updateUserTransactionStatus ~ transaction:", transaction)
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const userDetail = await this.usersService.findOneById(transaction?.user?.id);
      console.log("🚀 ~ TransactionsService ~ updateUserTransactionStatus ~ userDetail:", userDetail)

      if (isNull(userDetail) || isUndefined(userDetail)) {
        throw new BadRequestException(['User not found with id: ' + transaction?.user?.id]);
      }
      transaction.status = status;
      // Save the updated transaction
      await this.transactionssRepository.save(transaction);
      await this.usersService.updateWallet(userDetail?.id, finalAmount);
      return transaction; // Return the updated transaction
    } catch (error) {
      // Handle any errors that occur during the transaction update process
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  public async findTransactionByPaymentId(
    id: string,
  ): Promise<any> {
    const parsedValue = id;

    if (isNull(parsedValue) || isUndefined(parsedValue)) {
      throw new BadRequestException('Invalid payment id: ' + parsedValue);

    }

    const transaction: any = await this
      .transactionssRepository
      .createQueryBuilder("transactions")
      .where("transactions.paymentId = :paymentId", { paymentId: parsedValue })
      .leftJoinAndSelect('transactions.user', 'user')
      .select([
        'transactions',
        'user.id',
        'user.firstName',
        'user.lastName',
      ])
      .getOne();

    return transaction;
  }



  public async findTransactionById(
    id: string,
  ): Promise<any> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid transaction id: ' + parsedValue);

    }

    const transactionId: any = await this
      .transactionssRepository
      .createQueryBuilder("transactions")
      .where("transactions.id = :id", { id: parsedValue })
      .leftJoinAndSelect('transactions.user', 'user')
      .select([
        'transactions',
        'user.id',
        'user.firstName',
        'user.lastName',
      ])
      .getOne();

    return transactionId;
  }


  public async findOneById(
    id: number,
  ): Promise<Transactions> {
    const transactionId = await this.transactionssRepository.findOneBy({ id });
    console.log("🚀 ~ CardService ~ cardItem:", transactionId)
    this.commonService.checkEntityExistence(transactionId, 'transactions');
    return transactionId;
  }

  public async getTransactionsByUserId(
    id: string,
    pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<TransactionDto>> {
    const queryBuilder = this.transactionssRepository.createQueryBuilder("transactions");
    queryBuilder.where("transactions.userId = :id", { id: id })
      .leftJoinAndSelect('transactions.user', 'user')
      .select(['transactions', 'user.id', 'user.firstName', 'user.lastName',])
      .orderBy("transactions.createdAt", pageOptionsDto.order)

    if (pageOptionsDto.status !== '') {
      queryBuilder.andWhere("transactions.status like :status", { status: `%${pageOptionsDto.status}%` });
    }
    if (pageOptionsDto.status == '') {
      queryBuilder.andWhere("transactions.status IN(:...keys)", { keys: ['Paid'] });
    }

    const itemCount = await queryBuilder.getCount();
    let { entities }: any = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(await Promise.all(entities), pageMetaDto);
  }

  public async update(transactionId: string, dto: UpdateTransactionDto): Promise<Transactions> {
    try {
      const parsedValue = parseInt(transactionId, 10);

      if (isNaN(parsedValue) && !isInt(parsedValue)) {
        throw new BadRequestException('Invalid transaction id: ' + parsedValue);

      }
      const transactionData = await this.findOneById(parsedValue);
      // Update other fields
      Object.assign(transactionData, dto);

      // Save the updated sectionData
      await this.transactionssRepository.save(transactionData);

      // Return the updated section data
      return transactionData;
    } catch (error) {
      throw new BadRequestException([error?.message]);
    }

  }

  public async delete(id: string): Promise<IMessage> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid transaction id: ' + parsedValue);

    }
    await this.transactionssRepository.softDelete(parsedValue);
    return this.commonService.generateMessage('Transaction deleted successfully!');
  }






}


