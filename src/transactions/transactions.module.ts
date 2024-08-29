import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Transactions } from './entities/transactions.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsAdminController } from './transactions-admin/transactions-admin.controller';
import { UsersModule } from 'src/users/users.module';
import { Users } from 'src/users/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Notifications } from 'src/notifications/entities/notifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transactions, Users, Notifications]),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
  controllers: [TransactionsController, TransactionsAdminController],
})
export class TransactionsModule {}
