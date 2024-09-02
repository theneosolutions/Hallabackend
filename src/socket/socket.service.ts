import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    console.log('🚀 ~ SocketService ~ handleConnection ~ clientId:', clientId);
    this.connectedClients.set(clientId, socket);

    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
    });

    // Handle other events and messages from the client
  }

  async handleMessages(payload: any): Promise<any> {
    try {
      const sms: any = await this.whatsappService.saveAndSendMessage(payload);
      const chat: any = {
        isRead: false,
        action: sms?.action,
        actionData: sms?.actionData,
        actionType: sms?.actionType,
        sentBy: sms?.sentBy,
        actionUser: sms?.actionUser,
        contact: sms?.contact,
        event: sms?.event,
        id: sms?.id,
        createdAt: sms?.createdAt,
        updatedAt: sms?.createdAt,
      };

      return chat;
    } catch (error) {
      console.log('🚀 ~ SocketService ~ handleMessages ~ error:', error);
    }
  }

  async handleCheckInvitationCount(payload: any): Promise<any> {
    try {
      const { userId } = payload;
      const userDetails = await this.usersService.findOneById(userId);
      const retObj = {};
      retObj[userId] = {
        wallet: Number(userDetails.wallet || 0),
      };
      return retObj;
    } catch (error) {
      console.log(
        '🚀 ~ SocketService ~ handleCheckInvitationCount ~ error:',
        error,
      );
    }
  }
  // Add more methods for handling events, messages, etc.
}
