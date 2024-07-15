import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Socket;

  constructor(private readonly socketService: SocketService) {}

  getServerInstance(): any {
    return this.server;
  }

  @SubscribeMessage('chat')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
    console.log('🚀 ~ SocketGateway ~ handleSendMessage ~ payload:', payload);
    try {
      const sms: any = await this.socketService.handleMessages(payload);
      // console.log("🚀 ~ SocketGateway ~ handleSendMessage ~ sms:", sms)
      this.server.emit('chat', sms);
    } catch (error) {
      console.log('🚀 ~ SocketGateway ~ handleSendMessage ~ error:', error);
    }
  }

  afterInit(server: any) {
    console.log(server);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
  }

  // Implement other Socket.IO event handlers and message handlers
}
