import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ConversationsService } from '../../../src/conversations/conversations.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { createMockPrismaService } from '../prisma/prisma.service.mock';
import { CreateConversationInput } from '../../../src/conversations/dto/create-conversation.input';
import { UpdateConversationInput } from '../../../src/conversations/dto/update-conversation.input';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prismaService: PrismaService;

  const mockClerkUserId = 'mock-user-id';
  const mockConversationId = 'mock-conversation-id';

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const createConversationDto = {
        title: 'New Test Conversation',
      };

      await service.create({
        ...createConversationDto,
        userIds: [mockClerkUserId],
      });

      expect(prismaService.conversation.create).toHaveBeenCalledWith({
        data: {
          title: createConversationDto.title,
          clerkUserIds: [mockClerkUserId],
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all conversations for a user', async () => {
      await service.findAll(mockClerkUserId);

      expect(prismaService.conversation.findMany).toHaveBeenCalledWith({
        where: {
          clerkUserIds: { hasSome: [mockClerkUserId] },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a conversation when user has access', async () => {
      await service.findOne(mockConversationId, mockClerkUserId);

      expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockConversationId,
          clerkUserIds: { hasSome: [mockClerkUserId] },
        },
        include: {
          messages: true,
        },
      });
    });

    it('should return null when conversation is not found', async () => {
      jest
        .spyOn(prismaService.conversation, 'findFirst')
        .mockResolvedValueOnce(null);

      const result = await service.findOne(mockConversationId, mockClerkUserId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a conversation when user has access', async () => {
      const updateConversationDto: UpdateConversationInput = {
        id: mockConversationId,
        title: 'Updated Test Conversation',
      };

      await service.update(updateConversationDto, mockClerkUserId);

      expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockConversationId,
          clerkUserIds: { hasSome: [mockClerkUserId] },
        },
      });

      expect(prismaService.conversation.update).toHaveBeenCalledWith({
        where: { id: mockConversationId },
        data: { title: updateConversationDto.title },
      });
    });

    it('should throw ForbiddenException when user does not have access', async () => {
      const updateConversationDto: UpdateConversationInput = {
        id: mockConversationId,
        title: 'Updated Test Conversation',
      };

      jest
        .spyOn(prismaService.conversation, 'findFirst')
        .mockResolvedValueOnce(null);

      await expect(
        service.update(updateConversationDto, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaService.conversation.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a conversation when user has access', async () => {
      await service.remove(mockConversationId, mockClerkUserId);

      expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockConversationId,
          clerkUserIds: { hasSome: [mockClerkUserId] },
        },
      });

      expect(prismaService.conversation.delete).toHaveBeenCalledWith({
        where: { id: mockConversationId },
      });
    });

    it('should throw ForbiddenException when user does not have access', async () => {
      jest
        .spyOn(prismaService.conversation, 'findFirst')
        .mockResolvedValueOnce(null);

      await expect(
        service.remove(mockConversationId, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaService.conversation.delete).not.toHaveBeenCalled();
    });
  });
});
