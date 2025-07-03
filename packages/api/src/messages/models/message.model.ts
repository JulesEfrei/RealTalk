import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Conversation } from '../../conversations/models/conversation.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  conversationId: string;

  @Field()
  content: string;

  @Field(() => User)
  sender: User;

  @Field(() => Conversation)
  conversation: Conversation;

  @Field()
  createdAt: Date;
}
