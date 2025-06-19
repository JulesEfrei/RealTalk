import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Conversation } from '../../conversations/models/conversation.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  conversationId: string;

  @Field()
  content: string;


  @Field(() => Conversation)
  conversation: Conversation;

  @Field()
  createdAt: Date;
}
