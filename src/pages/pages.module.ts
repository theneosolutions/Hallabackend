import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PageService } from './pages.service';
import { PagesController } from './pages.controller';
import { UsersModule } from 'src/users/users.module';
import { Page } from './entities/page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), UsersModule],
  providers: [PageService],
  exports: [PageService],
  controllers: [PagesController],
})
export class PagesModule {}
