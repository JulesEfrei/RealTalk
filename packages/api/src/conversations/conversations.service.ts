import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(createConversationInput: CreateConversationInput) {
    return this.prisma.conversation.create({
      data: createConversationInput,
    });
  }

  async findAll(clerkUserId: string) {
    return this.prisma.conversation.findMany({
      where: {
        clerkUserIds: { has: clerkUserId },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, clerkUserId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        id,
        clerkUserIds: { has: clerkUserId },
      },
      include: { messages: true },
    });
  }

  async update(
    updateConversationInput: UpdateConversationInput,
    clerkUserId: string,
  ) {
    const { id, ...data } = updateConversationInput;

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        clerkUserIds: { has: clerkUserId },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, clerkUserId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        clerkUserIds: { has: clerkUserId },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return this.prisma.conversation.delete({
      where: { id },
    });
  }
}
