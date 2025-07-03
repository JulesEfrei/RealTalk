import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';
import { ForbiddenException } from '@nestjs/common';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: PrismaService,
          useValue: {
            conversation: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const createConversationInput: CreateConversationInput = {
        title: 'Test Conversation',
        userIds: ['user1', 'user2'],
      };
      const expectedConversation = {
        id: '1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.conversation, 'create').mockResolvedValue(expectedConversation);

      const result = await service.create(createConversationInput);

      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          title: createConversationInput.title,
          clerkUserIds: createConversationInput.userIds,
        },
      });
      expect(result).toEqual(expectedConversation);
    });
  });

  describe('findAll', () => {
    it('should return all conversations for a given user', async () => {
      const clerkUserId = 'user1';
      const expectedConversations = [
        {
          id: '1',
          title: 'Conversation 1',
          clerkUserIds: ['user1', 'user2'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(prisma.conversation, 'findMany').mockResolvedValue(expectedConversations);

      const result = await service.findAll(clerkUserId);

      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        where: {
          clerkUserIds: { hasSome: [clerkUserId] },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expectedConversations);
    });
  });

  describe('findOne', () => {
    it('should return a single conversation by ID for a given user', async () => {
      const id = '1';
      const clerkUserId = 'user1';
      const expectedConversation = {
        id: '1',
        title: 'Conversation 1',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };
      jest.spyOn(prisma.conversation, 'findFirst').mockResolvedValue(expectedConversation);

      const result = await service.findOne(id, clerkUserId);

      expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id,
          clerkUserIds: { hasSome: [clerkUserId] },
        },
        include: { messages: true },
      });
      expect(result).toEqual(expectedConversation);
    });
  });

  describe('update', () => {
    it('should update a conversation if the user has access', async () => {
      const updateConversationInput: UpdateConversationInput = {
        id: '1',
        title: 'Updated Conversation',
      };
      const clerkUserId = 'user1';
      const existingConversation = {
        id: '1',
        title: 'Old Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedConversation = {
        id: '1',
        title: 'Updated Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.conversation, 'findFirst').mockResolvedValue(existingConversation);
      jest.spyOn(prisma.conversation, 'update').mockResolvedValue(updatedConversation);

      const result = await service.update(updateConversationInput, clerkUserId);

      expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: updateConversationInput.id,
          clerkUserIds: { hasSome: [clerkUserId] },
        },
      });
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: updateConversationInput.id },
        data: { title: updateConversationInput.title },
      });
      expect(result).toEqual(updatedConversation);
    });

    it('should throw ForbiddenException if conversation not found or access denied', async () => {
      const updateConversationInput: UpdateConversationInput = {
        id: '1',
        title: 'Updated Conversation',
      };
      const clerkUserId = 'user1';
      jest.spyOn(prisma.conversation, 'findFirst').mockResolvedValue(null);

      await expect(service.update(updateConversationInput, clerkUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.update(updateConversationInput, clerkUserId)).rejects.toThrow('Conversation not found or access denied');
    });
  });

  describe('remove', () => {
    it('should remove a conversation if the user has access', async () => {
      const id = '1';
      const clerkUserId = 'user1';
      const existingConversation = {
        id: '1',
        title: 'Conversation to delete',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.conversation, 'findFirst').mockResolvedValue(existingConversation);
      jest.spyOn(prisma.conversation, 'delete').mockResolvedValue(existingConversation);

      const result = await service.remove(id, clerkUserId);

      expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id,
          clerkUserIds: { hasSome: [clerkUserId] },
        },
      });
      expect(prisma.conversation.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(existingConversation);
    });

    it('should throw ForbiddenException if conversation not found or access denied', async () => {
      const id = '1';
      const clerkUserId = 'user1';
      jest.spyOn(prisma.conversation, 'findFirst').mockResolvedValue(null);

      await expect(service.remove(id, clerkUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(id, clerkUserId)).rejects.toThrow('Conversation not found or access denied');
    });
  });
});