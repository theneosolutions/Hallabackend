import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly transactionsService: TransactionsService,
    private readonly eventsService: EventsService,
  ) {}

  public async getDashboardStats(): Promise<any> {
    const userStats = await this.usersService.userStats();
    const transactionsStats = await this.transactionsService.transactionStats();
    const eventsStats = await this.eventsService.eventsStats();
    const stats = { ...userStats, ...transactionsStats, ...eventsStats };
    return stats;
  }
}
