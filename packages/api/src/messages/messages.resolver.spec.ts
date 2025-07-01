import { Test, TestingModule } from '@nestjs/testing';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './models/message.model';
import { IAuthUser } from '../interfaces/auth.interface';
import { Conversation } from '../conversations/models/conversation.model';

describe('MessagesResolver', () => {
  let resolver: MessagesResolver;
  let messagesService: MessagesService;
  let prismaService: PrismaService;

  const mockMessagesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    conversation: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesResolver,
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<MessagesResolver>(MessagesResolver);
    messagesService = module.get<MessagesService>(MessagesService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createMessage', () => {
    it('should create a message', async () => {
      const createMessageInput: CreateMessageInput = {
        conversationId: 'conv1',
        content: 'Hello',
      };
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation: new Conversation(),
      };

      mockMessagesService.create.mockResolvedValue(expectedResult);

      const result = await resolver.createMessage(createMessageInput, user);

      expect(mockMessagesService.create).toHaveBeenCalledWith(
        createMessageInput,
        user.userId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all messages for a conversation', async () => {
      const conversationId = 'conv1';
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Message[] = [
        {
          id: 'msg1',
          conversationId: 'conv1',
          content: 'Test Message 1',
          senderId: 'user1',
          createdAt: new Date(),
          conversation: new Conversation(),
        },
        {
          id: 'msg2',
          conversationId: 'conv1',
          content: 'Test Message 2',
          senderId: 'user2',
          createdAt: new Date(),
          conversation: new Conversation(),
        },
      ];

      mockMessagesService.findAll.mockResolvedValue(expectedResult);

      const result = await resolver.findAll(conversationId, user);

      expect(mockMessagesService.findAll).toHaveBeenCalledWith(
        conversationId,
        user.userId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a message by id', async () => {
      const id = 'msg1';
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation: new Conversation(),
      };

      mockMessagesService.findOne.mockResolvedValue(expectedResult);

      const result = await resolver.findOne(id, user);

      expect(mockMessagesService.findOne).toHaveBeenCalledWith(id, user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeMessage', () => {
    it('should remove a message', async () => {
      const id = 'msg1';
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation: new Conversation(),
      };

      mockMessagesService.remove.mockResolvedValue(expectedResult);

      const result = await resolver.removeMessage(id, user);

      expect(mockMessagesService.remove).toHaveBeenCalledWith(id, user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getConversation', () => {
    it('should return the conversation for a message', async () => {
      const message: Message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation: new Conversation(),
      };
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.conversation.findFirst.mockResolvedValue(
        expectedResult,
      );

      const result = await resolver.getConversation(message, user);

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: message.conversationId,
          clerkUserIds: { has: user.userId },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if conversation not found', async () => {
      const message: Message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation: new Conversation(),
      };
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      await expect(
        resolver.getConversation(message, user),
      ).rejects.toThrow('Conversation not found or access denied');

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: message.conversationId,
          clerkUserIds: { has: user.userId },
        },
      });
    });
  });
});
