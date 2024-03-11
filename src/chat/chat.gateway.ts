import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
// import { AppService } from './app.service';
// import { Chat } from './chat.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer() server: Server;

  getServerInstance(): Server {
    return this.server;
  }

  @SubscribeMessage('chat')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
    console.log("🚀 ~ handleSendMessage ~ payload:", payload)
    // await this.appService.createMessage(payload);
    this.server.emit('chat', payload);
  }

  afterInit(server: Server) {
    console.log(server);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected ${client.id}`);
  }
}