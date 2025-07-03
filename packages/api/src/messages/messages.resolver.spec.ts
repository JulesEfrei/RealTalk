import { Test, TestingModule } from '@nestjs/testing';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './models/message.model';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { ForbiddenException } from '@nestjs/common';
import { Conversation } from '../conversations/models/conversation.model';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.model';
import { IAuthUser } from 'src/interfaces/auth.interface';

// Mock the ClerkAuth decorator
jest.mock('../auth/clerk.decorator', () => ({
  ClerkAuth: () =>
    jest.fn((target, key, descriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        // Inject a mock IAuthUser object as the last argument
        args.push({
          userId: 'mockUserId',
          sessionId: 'mockSessionId',
          orgId: 'mockOrgId',
        });
        return originalMethod.apply(this, args);
      };
      return descriptor;
    }),
}));

describe('MessagesResolver', () => {
  let resolver: MessagesResolver;
  let messagesService: MessagesService;
  let prismaService: PrismaService;
  let usersService: UsersService;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesResolver,
        {
          provide: MessagesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            conversation: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<MessagesResolver>(MessagesResolver);
    messagesService = module.get<MessagesService>(MessagesService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
    clientProxy = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getSender', () => {
    it('should return the sender of the message', async () => {
      const message: Message = {
        id: '1',
        content: 'test',
        conversationId: 'conv1',
        sender: { id: 'sender1', name: 'Sender User', avatar: '' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedUser: User = {
        id: 'sender1',
        name: 'Sender User',
        avatar: '',
      };
      jest.spyOn(usersService, 'findUserById').mockResolvedValue(expectedUser);

      const result = await resolver.getSender(message);

      expect(usersService.findUserById).toHaveBeenCalledWith(message.sender.id);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('createMessage', () => {
    it('should create a message and emit an event', async () => {
      const createMessageInput: CreateMessageInput = {
        content: 'Hello',
        conversationId: '1',
      };
      const expectedMessage: Message = {
        id: 'msg1',
        content: 'Hello',
        conversationId: '1',
        sender: { id: 'mockUserId', name: 'Mock User', avatar: '' } as User,
        createdAt: new Date(),
        conversation: {} as Conversation, // Mock conversation
      };
      jest.spyOn(messagesService, 'create').mockResolvedValue(expectedMessage);
      jest.spyOn(clientProxy, 'emit').mockReturnValue({} as any);

      const result = await resolver.createMessage(createMessageInput, {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(messagesService.create).toHaveBeenCalledWith(
        createMessageInput,
        'mockUserId',
      );
      expect(clientProxy.emit).toHaveBeenCalledWith(
        'message_created',
        expect.any(RmqRecordBuilder),
      );
      expect(result).toEqual(expectedMessage);
    });
  });

  describe('findAll', () => {
    it('should return all messages for a conversation', async () => {
      const conversationId = '1';
      const expectedMessages: Message[] = [
        {
          id: 'msg1',
          content: 'test',
          conversationId: '1',
          sender: { id: 'mockUserId', name: 'Mock User', avatar: '' } as User,
          createdAt: new Date(),
          conversation: {} as Conversation,
        },
      ];
      jest
        .spyOn(messagesService, 'findAll')
        .mockResolvedValue(expectedMessages);

      const result = await resolver.findAll(conversationId, {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(messagesService.findAll).toHaveBeenCalledWith(
        conversationId,
        'mockUserId',
      );
      expect(result).toEqual(expectedMessages);
    });
  });

  describe('findOne', () => {
    it('should return a single message by ID', async () => {
      const messageId = '1';
      const expectedMessage: Message = {
        id: 'msg1',
        content: 'test',
        conversationId: '1',
        sender: { id: 'mockUserId', name: 'Mock User', avatar: '' } as User,
        createdAt: new Date(),
        conversation: {} as Conversation,
      };
      jest.spyOn(messagesService, 'findOne').mockResolvedValue(expectedMessage);

      const result = await resolver.findOne(messageId, {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(messagesService.findOne).toHaveBeenCalledWith(
        messageId,
        'mockUserId',
      );
      expect(result).toEqual(expectedMessage);
    });
  });

  describe('removeMessage', () => {
    it('should remove a message', async () => {
      const messageId = '1';
      const expectedMessage: Message = {
        id: 'msg1',
        content: 'test',
        conversationId: '1',
        sender: { id: 'mockUserId', name: 'Mock User', avatar: '' } as User,
        createdAt: new Date(),
        conversation: {} as Conversation,
      };
      jest.spyOn(messagesService, 'remove').mockResolvedValue(expectedMessage);

      const result = await resolver.removeMessage(messageId, {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(messagesService.remove).toHaveBeenCalledWith(
        messageId,
        'mockUserId',
      );
      expect(result).toEqual(expectedMessage);
    });
  });

  describe('getConversation', () => {
    it('should return the conversation for a message if user has access', async () => {
      const message: Message = {
        id: 'msg1',
        content: 'test',
        conversationId: 'conv1',
        sender: { id: 'mockUserId', name: 'Mock User', avatar: '' } as User,
        createdAt: new Date(),
        conversation: {} as Conversation,
      };
      const expectedConversation: Conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['mockUserId'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };
      jest
        .spyOn(prismaService.conversation, 'findFirst')
        .mockResolvedValue(expectedConversation);

      const result = await resolver.getConversation(message, {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: message.conversationId,
          clerkUserIds: { hasSome: ['mockUserId'] },
        },
      });
      expect(result).toEqual(expectedConversation);
    });

    it('should throw ForbiddenException if conversation not found or access denied', async () => {
      const message: Message = {
        id: 'msg1',
        content: 'test',
        conversationId: 'conv1',
        sender: { id: 'mockUserId', name: 'Mock User', avatar: '' } as User,
        createdAt: new Date(),
        conversation: {} as Conversation,
      };
      jest
        .spyOn(prismaService.conversation, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        resolver.getConversation(message, {
          userId: 'mockUserId',
        } as IAuthUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        resolver.getConversation(message, {
          userId: 'mockUserId',
        } as IAuthUser),
      ).rejects.toThrow('Conversation not found or access denied');
    });
  });
});
