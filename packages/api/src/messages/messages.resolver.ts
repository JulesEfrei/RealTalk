import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { MessagesService } from './messages.service';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './models/message.model';
import { ClerkAuth } from '../auth/clerk.decorator';
import { Conversation } from '../conversations/models/conversation.model';
import { PrismaService } from '../prisma/prisma.service';
import { IAuthUser } from 'src/interfaces/auth.interface';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.model';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  @ResolveField('sender', () => User)
  async getSender(
    @Parent() message: Message & { senderId: string },
  ): Promise<User | null> {
    return this.usersService.findUserById(message.senderId);
  }

  @Mutation(() => Message)
  async createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    const createdMessage = await this.messagesService.create(
      createMessageInput,
      clerkUserId,
    );

    this.client.emit('message_created', {
      ...createdMessage,
      sender: await this.usersService.findUserById(createdMessage.senderId),
    });
    return createdMessage;
  }

  @Query(() => [Message], { name: 'messages' })
  findAll(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    return this.messagesService.findAll(conversationId, clerkUserId);
  }

  @Query(() => Message, { name: 'message' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    return this.messagesService.findOne(id, clerkUserId);
  }

  @Mutation(() => Message)
  removeMessage(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    return this.messagesService.remove(id, clerkUserId);
  }

  @ResolveField('conversation', () => Conversation)
  async getConversation(
    @Parent() message: Message,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: message.conversationId,
        clerkUserIds: { hasSome: [clerkUserId] },
      },
    });

    if (!conversation) {
      throw new ForbiddenException('Conversation not found or access denied');
    }

    return conversation;
  }
}
