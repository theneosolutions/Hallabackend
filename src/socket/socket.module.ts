import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Events } from 'src/events/entities/event.entity';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Events]),WhatsappModule],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}