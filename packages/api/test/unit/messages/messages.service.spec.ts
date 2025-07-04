import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MessagesService } from '../../../src/messages/messages.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { createMockPrismaService } from '../prisma/prisma.service.mock';
import { CreateMessageInput } from '../../../src/messages/dto/create-message.input';

describe('MessagesService', () => {
  let service: MessagesService;
  let prismaService: PrismaService;

  const mockClerkUserId = 'mock-user-id';
  const mockMessageId = 'mock-message-id';
  const mockConversationId = 'mock-conversation-id';

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a message when user has access to the conversation', async () => {
      const createMessageDto: CreateMessageInput = {
        conversationId: mockConversationId,
        content: 'New test message',
      };

      await service.create(createMessageDto, mockClerkUserId);

      expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockConversationId,
          clerkUserIds: { hasSome: [mockClerkUserId] },
        },
      });
      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: {
          ...createMessageDto,
          senderId: mockClerkUserId,
        },
        include: { conversation: true },
      });
    });

    it('should throw ForbiddenException when user does not have access to the conversation', async () => {
      const createMessageDto: CreateMessageInput = {
        conversationId: mockConversationId,
        content: 'New test message',
      };

      jest
        .spyOn(prismaService.conversation, 'findFirst')
        .mockResolvedValueOnce(null);

      await expect(
        service.create(createMessageDto, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.message.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return messages when user has access to the conversation', async () => {
      await service.findAll(mockConversationId, mockClerkUserId);

      expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockConversationId,
          clerkUserIds: { hasSome: [mockClerkUserId] },
        },
      });
      expect(prismaService.message.findMany).toHaveBeenCalledWith({
        where: { conversationId: mockConversationId },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should throw ForbiddenException when user does not have access to the conversation', async () => {
      jest
        .spyOn(prismaService.conversation, 'findFirst')
        .mockResolvedValueOnce(null);

      await expect(
        service.findAll(mockConversationId, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.message.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a message when user has access', async () => {
      await service.findOne(mockMessageId, mockClerkUserId);

      expect(prismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id: mockMessageId },
        include: { conversation: true },
      });
    });

    it('should throw ForbiddenException when message is not found', async () => {
      jest
        .spyOn(prismaService.message, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(
        service.findOne(mockMessageId, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user does not have access to the message', async () => {
      jest.spyOn(prismaService.message, 'findUnique').mockResolvedValueOnce({
        id: mockMessageId,
        conversationId: mockConversationId,
        content: 'Test message',
        senderId: mockClerkUserId,
        createdAt: new Date(),
        conversation: {
          id: mockConversationId,
          clerkUserIds: ['different-user-id'],
          title: 'Test Conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      await expect(
        service.findOne(mockMessageId, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a message when user has access', async () => {
      await service.remove(mockMessageId, mockClerkUserId);

      expect(prismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id: mockMessageId },
        include: { conversation: true },
      });
      expect(prismaService.message.delete).toHaveBeenCalledWith({
        where: { id: mockMessageId },
      });
    });

    it('should throw ForbiddenException when message is not found', async () => {
      jest
        .spyOn(prismaService.message, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(
        service.remove(mockMessageId, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.message.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not have access to the message', async () => {
      jest.spyOn(prismaService.message, 'findUnique').mockResolvedValueOnce({
        id: mockMessageId,
        conversationId: mockConversationId,
        content: 'Test message',
        senderId: mockClerkUserId,
        createdAt: new Date(),
        conversation: {
          id: mockConversationId,
          clerkUserIds: ['different-user-id'],
          title: 'Test Conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      await expect(
        service.remove(mockMessageId, mockClerkUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.message.delete).not.toHaveBeenCalled();
    });
  });
});
