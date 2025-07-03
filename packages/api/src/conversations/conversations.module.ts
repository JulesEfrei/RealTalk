import { Module, forwardRef } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsResolver } from './conversations.resolver';
import { MessagesModule } from '../messages/messages.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => MessagesModule), PrismaModule, UsersModule],
  providers: [ConversationsResolver, ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
