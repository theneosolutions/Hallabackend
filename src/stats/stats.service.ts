import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, Transaction } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { isInt } from 'class-validator';
import { SLUG_REGEX } from '../common/consts/regex.const';
import { UsersService } from 'src/users/users.service';
import { IMessage } from 'src/common/interfaces/message.interface';
import { TransactionsService } from 'src/transactions/transactions.service';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly transactionsService: TransactionsService,
    private readonly eventsService: EventsService,
    private readonly commonService: CommonService,
  ) {}

  public async getDashboardStats(): Promise<any> {
    const userStats = await this.usersService.userStats();
    const transactionsStats = await this.transactionsService.transactionStats();
    const eventsStats = await this.eventsService.eventsStats();
    const stats = { ...userStats, ...transactionsStats, ...eventsStats };
    return stats;
  }
}
