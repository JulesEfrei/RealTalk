import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageInput } from './dto/create-message.input';
import { IAuthUser } from '../interfaces/auth.interface';
import { MessagesGateway } from './messages.gateway';

describe('MessagesService', () => {
  let service: MessagesService;
  let prismaService: PrismaService;
  let messagesGateway: MessagesGateway;

  const mockPrismaService = {
    conversation: {
      findFirst: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockMessagesGateway = {
    sendNewMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MessagesGateway,
          useValue: mockMessagesGateway,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prismaService = module.get<PrismaService>(PrismaService);
    messagesGateway = module.get<MessagesGateway>(MessagesGateway);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const createMessageInput: CreateMessageInput = {
        conversationId: 'conv1',
        content: 'Hello',
      };
      const user: IAuthUser = { userId: 'user1' };
      const conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResult = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation,
      };

      mockPrismaService.conversation.findFirst.mockResolvedValue(conversation);
      mockPrismaService.message.create.mockResolvedValue(expectedResult);

      const result = await service.create(createMessageInput, user.userId);

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: createMessageInput.conversationId,
          clerkUserIds: { hasSome: [user.userId] },
        },
      });
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: { ...createMessageInput, senderId: user.userId },
        include: { conversation: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if conversation not found', async () => {
      const createMessageInput: CreateMessageInput = {
        conversationId: 'nonexistent',
        content: 'Test Message',
      };
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createMessageInput, user.userId),
      ).rejects.toThrow('Conversation not found or access denied');

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: createMessageInput.conversationId,
          clerkUserIds: { hasSome: [user.userId] },
        },
      });
      expect(mockPrismaService.message.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all messages for a conversation', async () => {
      const conversationId = 'conv1';
      const user: IAuthUser = { userId: 'user1' };
      const conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResult = [
        {
          id: 'msg1',
          conversationId: 'conv1',
          content: 'Test Message 1',
          senderId: 'user1',
          createdAt: new Date(),
        },
        {
          id: 'msg2',
          conversationId: 'conv1',
          content: 'Test Message 2',
          senderId: 'user2',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.conversation.findFirst.mockResolvedValue(conversation);
      mockPrismaService.message.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(conversationId, user.userId);

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: conversationId,
          clerkUserIds: { hasSome: [user.userId] },
        },
      });
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if conversation not found', async () => {
      const conversationId = 'nonexistent';
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      await expect(
        service.findAll(conversationId, user.userId),
      ).rejects.toThrow('Conversation not found or access denied');

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: conversationId,
          clerkUserIds: { hasSome: [user.userId] },
        },
      });
      expect(mockPrismaService.message.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a message by id', async () => {
      const id = 'msg1';
      const user: IAuthUser = { userId: 'user1' };
      const conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResult = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation,
      };

      mockPrismaService.message.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(id, user.userId);

      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { conversation: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if message not found', async () => {
      const id = 'nonexistent';
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.message.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id, user.userId)).rejects.toThrow(
        'Message not found or access denied',
      );

      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { conversation: true },
      });
    });

    it('should throw an error if user does not have access to the conversation', async () => {
      const id = 'msg1';
      const user: IAuthUser = { userId: 'user3' };
      const conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation,
      };

      mockPrismaService.message.findUnique.mockResolvedValue(message);

      await expect(service.findOne(id, user.userId)).rejects.toThrow(
        'Message not found or access denied',
      );

      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { conversation: true },
      });
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      const id = 'msg1';
      const user: IAuthUser = { userId: 'user1' };
      const conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation,
      };
      const expectedResult = { ...message };

      mockPrismaService.message.findUnique.mockResolvedValue(message);
      mockPrismaService.message.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id, user.userId);

      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { conversation: true },
      });
      expect(mockPrismaService.message.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if message not found', async () => {
      const id = 'nonexistent';
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.message.findUnique.mockResolvedValue(null);

      await expect(service.remove(id, user.userId)).rejects.toThrow(
        'Message not found or access denied',
      );

      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { conversation: true },
      });
      expect(mockPrismaService.message.delete).not.toHaveBeenCalled();
    });

    it('should throw an error if user does not have access to the conversation', async () => {
      const id = 'msg1';
      const user: IAuthUser = { userId: 'user3' };
      const conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test Message',
        senderId: 'user1',
        createdAt: new Date(),
        conversation,
      };

      mockPrismaService.message.findUnique.mockResolvedValue(message);

      await expect(service.remove(id, user.userId)).rejects.toThrow(
        'Message not found or access denied',
      );

      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { conversation: true },
      });
      expect(mockPrismaService.message.delete).not.toHaveBeenCalled();
    });
  });

  describe('handleMessageCreated', () => {
    it('should call messagesGateway.sendNewMessage', async () => {
      const message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Hello',
        senderId: 'user1',
      };

      await service.handleMessageCreated({ ...message, createdAt: new Date() }, {
        getChannelRef: () => ({
          ack: jest.fn(),
        }),
        getMessage: () => ({}),
      } as any);

      expect(mockMessagesGateway.sendNewMessage).toHaveBeenCalledWith(message);
    });
  });
});
