import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ConversationsService } from './conversations.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';
import { Conversation } from './models/conversation.model';
import { ClerkAuth } from '../auth/clerk.decorator';
import { MessagesService } from '../messages/messages.service';
import { Message } from '../messages/models/message.model';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Mutation(() => Conversation)
  createConversation(
    @Args('createConversationInput')
    createConversationInput: CreateConversationInput,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.conversationsService.create(
      createConversationInput,
      clerkUserId,
    );
  }

  @Query(() => [Conversation], { name: 'conversations' })
  findAll(@ClerkAuth() clerkUserId: string) {
    return this.conversationsService.findAll(clerkUserId);
  }

  @Query(() => Conversation, { name: 'conversation' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.conversationsService.findOne(id, clerkUserId);
  }

  @Mutation(() => Conversation)
  updateConversation(
    @Args('updateConversationInput')
    updateConversationInput: UpdateConversationInput,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.conversationsService.update(
      updateConversationInput,
      clerkUserId,
    );
  }

  @Mutation(() => Conversation)
  removeConversation(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.conversationsService.remove(id, clerkUserId);
  }

  @ResolveField('messages', () => [Message])
  async getMessages(
    @Parent() conversation: Conversation,
    @ClerkAuth() clerkUserId: string,
  ) {
    return this.messagesService.findAll(conversation.id, clerkUserId);
  }
}
