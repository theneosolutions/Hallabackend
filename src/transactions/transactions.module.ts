import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Transactions } from './entities/transactions.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsAdminController } from './transactions-admin/transactions-admin.controller';
import { UsersModule } from 'src/users/users.module';
import { Users } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transactions, Users]),
    forwardRef(() => UsersModule),
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
  controllers: [TransactionsController, TransactionsAdminController],
})
export class TransactionsModule {}
