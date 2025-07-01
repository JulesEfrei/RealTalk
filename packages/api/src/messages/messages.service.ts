import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageInput } from './dto/create-message.input';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageInput: CreateMessageInput, clerkUserId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: createMessageInput.conversationId,
        clerkUserIds: { has: clerkUserId },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return this.prisma.message.create({
      data: {
        ...createMessageInput,
        senderId: clerkUserId,
      },
      include: { conversation: true },
    });
  }

  async findAll(conversationId: string, clerkUserId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        clerkUserIds: { has: clerkUserId },
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

    if (!message || !message.conversation.clerkUserIds.includes(clerkUserId)) {
      throw new Error('Message not found or access denied');
    }

    return message;
  }

  async remove(id: string, clerkUserId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: { conversation: true },
    });

    if (!message || !message.conversation.clerkUserIds.includes(clerkUserId)) {
      throw new Error('Message not found or access denied');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }
}
