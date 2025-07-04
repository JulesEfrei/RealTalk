import { PrismaService } from '../../../src/prisma/prisma.service';

export const createMockPrismaService = () => {
  return {
    message: {
      create: jest.fn().mockImplementation((args) => Promise.resolve({
        id: 'mock-message-id',
        conversationId: args.data.conversationId,
        content: args.data.content,
        senderId: args.data.senderId,
        createdAt: new Date(),
        conversation: {
          id: args.data.conversationId,
          clerkUserIds: ['mock-user-id'],
          title: 'Test Conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([
        {
          id: 'mock-message-id',
          conversationId: 'mock-conversation-id',
          content: 'Test message',
          senderId: 'mock-user-id',
          createdAt: new Date()
        }
      ])),
      findUnique: jest.fn().mockImplementation(() => Promise.resolve({
        id: 'mock-message-id',
        conversationId: 'mock-conversation-id',
        content: 'Test message',
        senderId: 'mock-user-id',
        createdAt: new Date(),
        conversation: {
          id: 'mock-conversation-id',
          clerkUserIds: ['mock-user-id'],
          title: 'Test Conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })),
      delete: jest.fn().mockImplementation(() => Promise.resolve({
        id: 'mock-message-id',
        conversationId: 'mock-conversation-id',
        content: 'Test message',
        senderId: 'mock-user-id',
        createdAt: new Date()
      }))
    },
    conversation: {
      create: jest.fn().mockImplementation((args) => Promise.resolve({
        id: 'mock-conversation-id',
        title: args.data.title,
        clerkUserIds: args.data.clerkUserIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([
        {
          id: 'mock-conversation-id',
          title: 'Test Conversation',
          clerkUserIds: ['mock-user-id'],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ])),
      findFirst: jest.fn().mockImplementation(() => Promise.resolve({
        id: 'mock-conversation-id',
        title: 'Test Conversation',
        clerkUserIds: ['mock-user-id'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      })),
      update: jest.fn().mockImplementation((args) => Promise.resolve({
        id: args.where.id,
        title: args.data.title || 'Test Conversation',
        clerkUserIds: ['mock-user-id'],
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      delete: jest.fn().mockImplementation(() => Promise.resolve({
        id: 'mock-conversation-id',
        title: 'Test Conversation',
        clerkUserIds: ['mock-user-id'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    },
    $on: jest.fn(),
    $connect: jest.fn()
  } as unknown as PrismaService;
};
