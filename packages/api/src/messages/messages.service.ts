import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageInput } from './dto/create-message.input';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private rabbitMQService: RabbitMQService,
  ) {}

  async create(createMessageInput: CreateMessageInput, clerkUserId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: createMessageInput.conversationId,
        clerkUserId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const message = await this.prisma.message.create({
      data: createMessageInput,
      include: { conversation: true },
    });

    await this.rabbitMQService.publishMessage('message.created', {
      id: message.id,
      content: message.content,
      conversationId: message.conversationId,
      createdAt: message.createdAt,
    });

    return message;
  }

  async findAll(conversationId: string, clerkUserId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        clerkUserId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, clerkUserId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: { conversation: true },
    });

    if (!message || message.conversation.clerkUserId !== clerkUserId) {
      throw new Error('Message not found or access denied');
    }

    return message;
  }

  async remove(id: string, clerkUserId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: { conversation: true },
    });

    if (!message || message.conversation.clerkUserId !== clerkUserId) {
      throw new Error('Message not found or access denied');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }
}
