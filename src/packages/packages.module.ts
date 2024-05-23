import { PackagesService } from './packages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Packages } from './entities/packages.entity';
import { PackagesController } from './packages.controller';
import { StripeModule } from './../stripe/stripe.module';
import { PackagesUsersController } from './packages-users/packages-users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Packages]), StripeModule],
  providers: [PackagesService],
  exports: [PackagesService],
  controllers: [PackagesController, PackagesUsersController],
})
export class PackagesModule {}
