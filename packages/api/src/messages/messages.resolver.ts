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

@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => Message)
  createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.messagesService.create(createMessageInput, clerkUserId);
  }

  @Query(() => [Message], { name: 'messages' })
  findAll(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.messagesService.findAll(conversationId, clerkUserId);
  }

  @Query(() => Message, { name: 'message' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.messagesService.findOne(id, clerkUserId);
  }

  @Mutation(() => Message)
  removeMessage(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.messagesService.remove(id, clerkUserId);
  }

  @ResolveField('conversation', () => Conversation)
  async getConversation(
    @Parent() message: Message,
    @ClerkAuth() clerkUserId: string,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: message.conversationId,
        clerkUserId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return conversation;
  }
}
