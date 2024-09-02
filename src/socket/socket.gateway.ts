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

  @SubscribeMessage('chat-send-message')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
    console.log('🚀 ~ SocketGateway ~ handleSendMessage ~ payload:', payload);
    try {
      const sms: any = await this.socketService.handleMessages(payload);
      this.server.emit('chat-receive-message', sms);
    } catch (error) {
      console.log('🚀 ~ SocketGateway ~ handleSendMessage ~ error:', error);
    }
  }

  @SubscribeMessage('check-invitation-count')
  async handleInvitationCountUpdate(
    client: Socket,
    payload: any,
  ): Promise<void> {
    try {
      const invitationCountObject =
        await this.socketService.handleCheckInvitationCount(payload);

      console.log(
        '🚀 ~ SocketGateway ~ User: ',
        payload.userId,
        ' wallet balance:',
        invitationCountObject[payload.userId],
      );
      this.server.emit('invitation-count-updated', invitationCountObject);
    } catch (error) {
      console.log(
        '🚀 ~ SocketGateway ~ handleInvitationCountUpdate ~ error:',
        error,
      );
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
