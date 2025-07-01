import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';
import { IAuthUser } from '../interfaces/auth.interface';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const createConversationInput: CreateConversationInput = {
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
      };

      const expectedResult = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.conversation.create.mockResolvedValue(expectedResult);

      const result = await service.create(createConversationInput);

      expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({
        data: createConversationInput,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all conversations for a user', async () => {
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult = [
        {
          id: 'conv1',
          title: 'Test Conversation 1',
          clerkUserIds: ['user1', 'user2'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'conv2',
          title: 'Test Conversation 2',
          clerkUserIds: ['user1', 'user3'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.conversation.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(user.userId);

      expect(mockPrismaService.conversation.findMany).toHaveBeenCalledWith({
        where: {
          clerkUserIds: { has: user.userId },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by id', async () => {
      const id = 'conv1';
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      mockPrismaService.conversation.findFirst.mockResolvedValue(
        expectedResult,
      );

      const result = await service.findOne(id, user.userId);

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id,
          clerkUserIds: { has: user.userId },
        },
        include: { messages: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return null if conversation not found', async () => {
      const id = 'nonexistent';
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      const result = await service.findOne(id, user.userId);

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id,
          clerkUserIds: { has: user.userId },
        },
        include: { messages: true },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a conversation', async () => {
      const updateConversationInput: UpdateConversationInput = {
        id: 'conv1',
        title: 'Updated Conversation',
      };
      const user: IAuthUser = { userId: 'user1' };
      const existingConversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResult = {
        ...existingConversation,
        title: 'Updated Conversation',
      };

      mockPrismaService.conversation.findFirst.mockResolvedValue(
        existingConversation,
      );
      mockPrismaService.conversation.update.mockResolvedValue(expectedResult);

      const result = await service.update(updateConversationInput, user.userId);

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: updateConversationInput.id,
          clerkUserIds: { has: user.userId },
        },
      });
      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
        where: { id: updateConversationInput.id },
        data: { title: updateConversationInput.title },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if conversation not found', async () => {
      const updateConversationInput: UpdateConversationInput = {
        id: 'nonexistent',
        title: 'Updated Conversation',
      };
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      await expect(
        service.update(updateConversationInput, user.userId),
      ).rejects.toThrow('Conversation not found or access denied');

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: updateConversationInput.id,
          clerkUserIds: { has: user.userId },
        },
      });
      expect(mockPrismaService.conversation.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a conversation', async () => {
      const id = 'conv1';
      const user: IAuthUser = { userId: 'user1' };
      const existingConversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResult = { ...existingConversation };

      mockPrismaService.conversation.findFirst.mockResolvedValue(
        existingConversation,
      );
      mockPrismaService.conversation.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id, user.userId);

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id,
          clerkUserIds: { has: user.userId },
        },
      });
      expect(mockPrismaService.conversation.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if conversation not found', async () => {
      const id = 'nonexistent';
      const user: IAuthUser = { userId: 'user1' };

      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      await expect(service.remove(id, user.userId)).rejects.toThrow(
        'Conversation not found or access denied',
      );

      expect(mockPrismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id,
          clerkUserIds: { has: user.userId },
        },
      });
      expect(mockPrismaService.conversation.delete).not.toHaveBeenCalled();
    });
  });
});
