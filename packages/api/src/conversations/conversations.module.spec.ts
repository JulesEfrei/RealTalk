import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsModule } from './conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

describe('ConversationsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConversationsModule, MessagesModule, PrismaModule, UsersModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
