 

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Transactions } from './entities/transactions.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsAdminController } from './transactions-admin/transactions-admin.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions]),UsersModule],
  providers: [TransactionsService],
  exports: [TransactionsService],
  controllers: [TransactionsController,TransactionsAdminController],
})
export class TransactionsModule {}
