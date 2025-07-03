import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(createConversationInput: CreateConversationInput) {
    return this.prisma.conversation.create({
      data: {
        title: createConversationInput.title,
        clerkUserIds: createConversationInput.userIds,
      },
    });
  }

  async findAll(clerkUserId: string) {
    return this.prisma.conversation.findMany({
      where: {
        clerkUserIds: { hasSome: [clerkUserId] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, clerkUserId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        id,
        clerkUserIds: { hasSome: [clerkUserId] },
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
        clerkUserIds: { hasSome: [clerkUserId] },
      },
    });

    if (!conversation) {
      throw new ForbiddenException('Conversation not found or access denied');
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
        clerkUserIds: { hasSome: [clerkUserId] },
      },
    });

    if (!conversation) {
      throw new ForbiddenException('Conversation not found or access denied');
    }

    return this.prisma.conversation.delete({
      where: { id },
    });
  }
}
