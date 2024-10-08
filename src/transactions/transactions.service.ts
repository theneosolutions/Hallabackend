import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Transactions } from './entities/transactions.entity';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { isInt } from 'class-validator';
import { TransactionDto } from './dtos/create-transaction';
import { UsersService } from 'src/users/users.service';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { IMessage } from 'src/common/interfaces/message.interface';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationDto } from 'src/notifications/dtos/create-notification.dto';
import { Users } from 'src/users/entities/user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionssRepository: Repository<Transactions>,
    private readonly commonService: CommonService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {}

  public async create(
    origin: string | undefined,
    dto: TransactionDto,
  ): Promise<Transactions> {
    const {
      user: userId,
      amount,
      description,
      package: packageId,
      paymentId,
    } = dto;

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

    if (isNull(packageId) || isUndefined(packageId)) {
      throw new BadRequestException(['paymentId cannot be null']);
    }

    const transaction = this.transactionssRepository.create({
      amount: amount,
      description: description,
      paymentId: paymentId,
      status: 'Initiated',
      user: userId,
      package: packageId,
    });
    await this.transactionssRepository.insert(transaction);
    return transaction;
  }

  public async findOneByWhere(where: any): Promise<Transactions[]> {
    const contactsItems = await this.transactionssRepository.findBy(where);
    return contactsItems;
  }

  public async revenueGenereatedByUser(userId: number): Promise<number> {
    const revenueGenerated = await this.transactionssRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'revenueGenerated')
      .where('transaction.status = :status', { status: 'Paid' })
      .andWhere('transaction.userId = :userId', { userId: userId })
      .getRawOne();

    return revenueGenerated?.revenueGenerated;
  }

  public async updateUserTransactionStatus(
    id: string,
    status: string,
  ): Promise<Transactions> {
    try {
      const transaction = await this.findTransactionByPaymentId(id);
      if (!transaction) {
        throw new BadRequestException([
          'Transaction not found against payment id: ' + id,
        ]);
      }

      console.log(
        '>>>>>>>>>> Payment status:',
        status,
        '>>>>>>>>>> PaymentId:',
        id,
      );

      // If transaction status is same as status param then do nothing
      if (
        transaction.status.toLocaleLowerCase() === status.toLocaleLowerCase()
      ) {
        return transaction;
      }

      const userDetail = await this.usersService.findOneById(
        transaction?.user?.id,
      );

      if (isNull(userDetail) || isUndefined(userDetail)) {
        throw new BadRequestException([
          'User not found with id: ' + transaction?.user?.id,
        ]);
      }

      transaction.status = status;
      await this.transactionssRepository.save(transaction);

      if (status.toLocaleLowerCase() === 'failed') {
        this.sendPaymentNotification(
          id,
          'Payment is failed and invitation count is not updated',
        );
        return transaction;
      }

      const invitations: number =
        Number(transaction?.package?.numberOfGuest) || 0;

      await this.usersService.updateWallet(userDetail, invitations);
      // Send socket emit
      await this.emitInvitationCountUpdateEvent(userDetail);
      this.sendPaymentNotification(
        id,
        'Payment is successfull and invitation count updated',
      );
      return transaction;
    } catch (error) {
      // Handle any errors that occur during the transaction update process
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  private async emitInvitationCountUpdateEvent(
    userDetail: Users,
  ): Promise<void> {
    const server = this.socketGateway.getServerInstance();
    if (server) {
      const retObj = {};
      retObj[userDetail.id] = {
        wallet: Number(userDetail.wallet || 0),
      };
      server.emit('invitation-count-updated', retObj);
    } else {
      console.error('Server instance not available');
    }
  }

  public async findTransactionByPaymentId(id: string): Promise<any> {
    const parsedValue = id;

    if (isNull(parsedValue) || isUndefined(parsedValue)) {
      throw new BadRequestException('Invalid payment id: ' + parsedValue);
    }

    const transaction: any = await this.transactionssRepository
      .createQueryBuilder('transactions')
      .where('transactions.paymentId = :paymentId', { paymentId: parsedValue })
      .leftJoinAndSelect('transactions.user', 'user')
      .leftJoinAndSelect('transactions.package', 'package')
      .select([
        'transactions',
        'package',
        'user.id',
        'user.firstName',
        'user.lastName',
      ])
      .getOne();

    return transaction;
  }

  public async findTransactionById(id: string): Promise<any> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid transaction id: ' + parsedValue);
    }

    const transactionId: any = await this.transactionssRepository
      .createQueryBuilder('transactions')
      .where('transactions.id = :id', { id: parsedValue })
      .leftJoinAndSelect('transactions.user', 'user')
      .leftJoinAndSelect('transactions.package', 'package')
      .select([
        'transactions',
        'package',
        'user.id',
        'user.firstName',
        'user.lastName',
      ])
      .getOne();

    return transactionId;
  }

  public async findOneById(id: number): Promise<Transactions> {
    const transactionId = await this.transactionssRepository.findOneBy({ id });
    console.log('🚀 ~ CardService ~ cardItem:', transactionId);
    this.commonService.checkEntityExistence(transactionId, 'transactions');
    return transactionId;
  }

  public async getTransactionsByUserId(
    id: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<TransactionDto>> {
    const queryBuilder =
      this.transactionssRepository.createQueryBuilder('transactions');
    queryBuilder
      .where('transactions.userId = :id', { id: id })
      .leftJoinAndSelect('transactions.user', 'user')
      .select(['transactions', 'user.id', 'user.firstName', 'user.lastName'])
      .orderBy('transactions.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.status !== '') {
      queryBuilder.andWhere('transactions.status like :status', {
        status: `%${pageOptionsDto.status}%`,
      });
    }
    if (pageOptionsDto.status == '') {
      queryBuilder.andWhere('transactions.status IN(:...keys)', {
        keys: ['Paid'],
      });
    }

    const itemCount = await queryBuilder.getCount();
    const { entities }: any = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(await Promise.all(entities), pageMetaDto);
  }

  public async update(
    transactionId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transactions> {
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
    return this.commonService.generateMessage(
      'Transaction deleted successfully!',
    );
  }

  public async getTransactions(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<TransactionDto>> {
    console.log('pageOptionsDto', pageOptionsDto);

    const queryBuilder =
      this.transactionssRepository.createQueryBuilder('transactions');

    queryBuilder
      .leftJoinAndSelect('transactions.user', 'user')
      .select(['transactions', 'user.id', 'user.firstName', 'user.lastName'])
      .orderBy('transactions.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async transactionStats(): Promise<any> {
    const totalRevenue = await this.transactionssRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'totalRevenue')
      .where('transaction.status = :status', { status: 'Paid' })
      .getRawOne();

    const currentDate = new Date();
    const twelveMonthsAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 11,
      1,
    );

    const revenueByMonth = await this.transactionssRepository
      .createQueryBuilder('transaction')
      .select(
        'YEAR(transaction.createdAt) AS year, MONTH(transaction.createdAt) AS month, SUM(transaction.amount) AS revenue',
      )
      .where('transaction.status = :status', { status: 'Paid' })
      .andWhere('transaction.createdAt >= :startDate', {
        startDate: twelveMonthsAgo,
      })
      .groupBy('YEAR(transaction.createdAt), MONTH(transaction.createdAt)')
      .orderBy('YEAR(transaction.createdAt), MONTH(transaction.createdAt)')
      .getRawMany();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      // 12 months
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthLabel = `${monthNames[month - 1]}-${year}`;

      let revenue = 0;
      const foundEntry = revenueByMonth.find(
        (entry) => entry.year === year && entry.month === month,
      );
      if (foundEntry) {
        revenue = parseFloat(foundEntry.revenue);
      }
      chartData.push({
        month: `${year}-${month.toString().padStart(2, '0')}`,
        monthName: monthLabel,
        revenue,
      });
    }

    let growthRate = 0;
    if (chartData.length >= 2) {
      const currentMonthRevenue = chartData[chartData.length - 1].revenue;
      const previousMonthRevenue = chartData[chartData.length - 2].revenue;
      if (previousMonthRevenue !== 0) {
        growthRate =
          ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100;
      }
    }

    return {
      totalRevenue: totalRevenue.totalRevenue,
      revenueChartData: {
        chartData,
        growthRate: +growthRate.toFixed(2),
        currentMonthRevenue: chartData[chartData.length - 1].revenue,
      },
    };
  }

  public async sendPaymentNotification(paymentId: string, message: string) {
    const transaction = await this.findTransactionByPaymentId(paymentId);
    if (!transaction) {
      throw new BadRequestException([
        'Transactions ~ service ~ sendPaymentNotification ~ Not found against payment id: ' +
          paymentId,
      ]);
    }
    const notificationDto: NotificationDto = {
      user: transaction.user.id,
      resourceId: transaction.user.id,
      resourceType: 'custom-notification',
      parent: null,
      parentType: 'custom-notification',
      sendNotificationTo: transaction.user.id,
      content: {
        body: message,
      },
    };

    await this.notificationsService.create(undefined, notificationDto);
  }
}
