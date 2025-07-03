import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds: string[];
}
