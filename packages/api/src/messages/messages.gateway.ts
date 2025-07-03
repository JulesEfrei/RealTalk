import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message.input';
import { Server } from 'socket.io';
import { ConversationsService } from '../conversations/conversations.service';
import { WsClerkAuthGuard } from '../auth/ws-clerk-auth.guard';

@WebSocketGateway({
  cors: {
    // origin: process.env.ALLOWED_ORIGINS?.split(',') || ['localhost:3001'],
    origin: '*',
    // credentials: true,
  },
})
@UseGuards(WsClerkAuthGuard)
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly conversationsService: ConversationsService) {}

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client,
  ): Promise<void> {
    const clerkUserId = client.handshake.auth?.userId;
    const conversation = await this.conversationsService.findOne(
      conversationId,
      clerkUserId,
    );

    if (!conversation) {
      throw new UnauthorizedException(
        'Conversation not found or access denied.',
      );
    }

    client.join(conversationId);

    this.logger.log(
      `Client ${client.id} joined conversation ${conversationId}`,
    );
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client,
  ): void {
    client.leave(conversationId);
    this.logger.log(`Client ${client.id} left conversation ${conversationId}`);
  }

  async sendNewMessage(
    message: CreateMessageInput & { id: string; senderId: string },
  ) {
    const conversation = await this.conversationsService.findOne(
      message.conversationId,
      message.senderId,
    );

    if (!conversation) {
      throw new UnauthorizedException(
        'Conversation not found or access denied.',
      );
    }

    this.server.to(message.conversationId).emit('newMessage', message);
    this.logger.log(
      `New message sent to conversation ${message.conversationId}: ${message.content}`,
    );
  }
}
