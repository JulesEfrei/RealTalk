import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesResolver } from './messages.resolver';
import { MessagesGateway } from './messages.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => RabbitMQModule),
    forwardRef(() => ConversationsModule),
    UsersModule,
  ],
  providers: [MessagesResolver, MessagesService, MessagesGateway],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
