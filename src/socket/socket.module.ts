import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => WhatsappModule), forwardRef(() => UsersModule)],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway],
})
export class SocketModule {}
