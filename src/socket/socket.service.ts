import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { NotificationDto } from 'src/Notifications/dtos/create-notification.dto';
import { NotificationsService } from 'src/Notifications/notifications.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly notificationService: NotificationsService;

  constructor(
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
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

  async sendChatMessageNotification(payload: any) {
    const notificationDto: NotificationDto = {
      user: payload.usersId,
      resourceId: payload.usersId,
      resourceType: 'custom-notification',
      parent: null,
      parentType: 'custom-notification',
      sendNotificationTo: payload.usersId,
      content: undefined,
    };
    notificationDto.content.body = `${payload.invites.name} sent you message for an event ${payload.events.name}`;
    console.log('WAHMED >>>>>>>>>>>>>> Notification detail:', notificationDto);

    await this.notificationService.create(undefined, notificationDto);
  }

  // Add more methods for handling events, messages, etc.
}
