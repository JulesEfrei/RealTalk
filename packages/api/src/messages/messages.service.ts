import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageInput } from './dto/create-message.input';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageInput: CreateMessageInput, clerkUserId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: createMessageInput.conversationId,
        clerkUserIds: { hasSome: [clerkUserId] },
      },
    });

    if (!conversation) {
      throw new ForbiddenException('Conversation not found or access denied');
    }

    const newMessage = await this.prisma.message.create({
      data: {
        ...createMessageInput,
        senderId: clerkUserId,
      },
      include: { conversation: true },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessage: newMessage.createdAt },
    });

    return newMessage;
  }

  async findAll(conversationId: string, clerkUserId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        clerkUserIds: { hasSome: [clerkUserId] },
      },
    });

    if (!conversation) {
      throw new ForbiddenException('Conversation not found or access denied');
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

    if (
      !message ||
      !message.conversation.clerkUserIds.some((id) => id === clerkUserId)
    ) {
      throw new ForbiddenException('Message not found or access denied');
    }

    return message;
  }

  async remove(id: string, clerkUserId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: { conversation: true },
    });

    if (
      !message ||
      !message.conversation.clerkUserIds.some((id) => id === clerkUserId)
    ) {
      throw new ForbiddenException('Message not found or access denied');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }
}
