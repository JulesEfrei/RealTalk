import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from '../../messages/models/message.model';

@ObjectType()
export class Conversation {
  @Field(() => ID)
  id: string;

  @Field(() => [String])
  clerkUserIds: string[];

  @Field()
  title: string;

  @Field(() => [Message], { nullable: true })
  messages?: Message[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
