import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Events } from 'src/events/entities/event.entity';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { Repository } from 'typeorm';

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    private readonly whatsappService: WhatsappService
  ) {}

  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    console.log("🚀 ~ SocketService ~ handleConnection ~ clientId:", clientId)
    this.connectedClients.set(clientId, socket);

    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
    });

    // Handle other events and messages from the client
  }

  async handleMessages(payload:any): Promise<any> {
   try {
    console.log("🚀 ~ handleSendMessage ~ payload:", payload)
    const sms:any = await this.whatsappService.saveAndSendMessage(payload);
    const chat:any ={
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
        updatedAt: sms?.createdAt
      }
      console.log("🚀 ~ SocketGateway ~ handleSendMessage ~ sms:", chat)
   
    return chat;
   } catch (error) {
    console.log("🚀 ~ SocketService ~ handleMessages ~ error:", error)
    
   }
  }

  // Add more methods for handling events, messages, etc.
}