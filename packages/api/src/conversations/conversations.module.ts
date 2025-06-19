import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsResolver } from './conversations.resolver';
import { MessagesService } from '../messages/messages.service';

@Module({
  providers: [ConversationsResolver, ConversationsService, MessagesService],
})
export class ConversationsModule {}
