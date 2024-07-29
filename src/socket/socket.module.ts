import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway],
})
export class SocketModule {}
