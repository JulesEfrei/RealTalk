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
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.model';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Conversation)
  createConversation(
    @Args('createConversationInput')
    createConversationInput: CreateConversationInput,
    @ClerkAuth() { userId: clerkUserId }: IAuthUser,
  ) {
    if (!createConversationInput.userIds.includes(clerkUserId)) {
      createConversationInput.userIds.push(clerkUserId);
    }

    return this.conversationsService.create(createConversationInput);
  }

  @ResolveField('users', () => [User])
  async getUsers(
    @Parent() conversation: Conversation & { clerkUserIds: string[] },
  ): Promise<User[]> {
    return this.usersService.findUsersByIds(conversation.clerkUserIds);
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
