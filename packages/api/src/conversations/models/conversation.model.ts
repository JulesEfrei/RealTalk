import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from '../../messages/models/message.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Conversation {
  @Field(() => ID)
  id: string;

  @Field(() => [User])
  users: User[];

  @Field()
  title: string;

  @Field(() => [Message], { nullable: true })
  messages?: Message[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  lastMessage?: Date;
}
