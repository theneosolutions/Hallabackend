import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Users } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersAdminController } from './admin.controller';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    forwardRef(() => TransactionsModule),
    forwardRef(() => EventsModule),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController, UsersAdminController],
})
export class UsersModule {}
