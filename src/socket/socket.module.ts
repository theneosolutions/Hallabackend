import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Events } from 'src/events/entities/event.entity';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Events]),
    forwardRef(() => WhatsappModule),
  ],
  providers: [SocketGateway, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
