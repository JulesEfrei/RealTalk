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
import { IAuthUser } from 'src/interfaces/auth.interface';

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
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    if (!createConversationInput.clerkUserIds.includes(clerkUserId)) {
      createConversationInput.clerkUserIds.push(clerkUserId);
    }

    return this.conversationsService.create(createConversationInput);
  }

  @Query(() => [Conversation], { name: 'conversations' })
  findAll(@ClerkAuth() clerkUser: IAuthUser) {
    return this.conversationsService.findAll(clerkUser.userId);
  }

  @Query(() => Conversation, { name: 'conversation' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    return this.conversationsService.findOne(id, clerkUserId);
  }

  @Mutation(() => Conversation)
  updateConversation(
    @Args('updateConversationInput')
    updateConversationInput: UpdateConversationInput,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    return this.conversationsService.update(
      updateConversationInput,
      clerkUserId,
    );
  }

  @Mutation(() => Conversation)
  removeConversation(
    @Args('id', { type: () => ID }) id: string,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    return this.conversationsService.remove(id, clerkUserId);
  }

  @ResolveField('messages', () => [Message])
  async getMessages(
    @Parent() conversation: Conversation,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    return this.messagesService.findAll(conversation.id, clerkUserId);
  }
}
