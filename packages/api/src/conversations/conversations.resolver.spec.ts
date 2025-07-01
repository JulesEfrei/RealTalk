import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsResolver } from './conversations.resolver';
import { ConversationsService } from './conversations.service';
import { MessagesService } from '../messages/messages.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';
import { IAuthUser } from '../interfaces/auth.interface';
import { Conversation } from './models/conversation.model';

describe('ConversationsResolver', () => {
  let resolver: ConversationsResolver;
  let conversationsService: ConversationsService;
  let messagesService: MessagesService;

  const mockConversationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockMessagesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsResolver,
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
      ],
    }).compile();

    resolver = module.get<ConversationsResolver>(ConversationsResolver);
    conversationsService = module.get<ConversationsService>(ConversationsService);
    messagesService = module.get<MessagesService>(MessagesService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a conversation and include the current user', async () => {
      const createConversationInput: CreateConversationInput = {
        title: 'Test Conversation',
        clerkUserIds: ['user2'],
      };
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user2', 'user1'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationsService.create.mockResolvedValue(expectedResult);

      const result = await resolver.createConversation(
        createConversationInput,
        user,
      );

      // Check if the current user was added to clerkUserIds
      expect(createConversationInput.clerkUserIds).toContain(user.userId);
      expect(mockConversationsService.create).toHaveBeenCalledWith(
        createConversationInput,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should not add duplicate user to clerkUserIds', async () => {
      const createConversationInput: CreateConversationInput = {
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
      };
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationsService.create.mockResolvedValue(expectedResult);

      const result = await resolver.createConversation(
        createConversationInput,
        user,
      );

      // Check that clerkUserIds still has only unique values
      expect(createConversationInput.clerkUserIds).toEqual(['user1', 'user2']);
      expect(mockConversationsService.create).toHaveBeenCalledWith(
        createConversationInput,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all conversations for a user', async () => {
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Conversation[] = [
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

      mockConversationsService.findAll.mockResolvedValue(expectedResult);

      const result = await resolver.findAll(user);

      expect(mockConversationsService.findAll).toHaveBeenCalledWith(user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by id', async () => {
      const id = 'conv1';
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationsService.findOne.mockResolvedValue(expectedResult);

      const result = await resolver.findOne(id, user);

      expect(mockConversationsService.findOne).toHaveBeenCalledWith(id, user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateConversation', () => {
    it('should update a conversation', async () => {
      const updateConversationInput: UpdateConversationInput = {
        id: 'conv1',
        title: 'Updated Conversation',
      };
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Conversation = {
        id: 'conv1',
        title: 'Updated Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationsService.update.mockResolvedValue(expectedResult);

      const result = await resolver.updateConversation(
        updateConversationInput,
        user,
      );

      expect(mockConversationsService.update).toHaveBeenCalledWith(
        updateConversationInput,
        user.userId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeConversation', () => {
    it('should remove a conversation', async () => {
      const id = 'conv1';
      const user: IAuthUser = { userId: 'user1' };
      const expectedResult: Conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationsService.remove.mockResolvedValue(expectedResult);

      const result = await resolver.removeConversation(id, user);

      expect(mockConversationsService.remove).toHaveBeenCalledWith(id, user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMessages', () => {
    it('should return messages for a conversation', async () => {
      const conversation: Conversation = {
        id: 'conv1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const user: IAuthUser = { userId: 'user1' };
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

      mockMessagesService.findAll.mockResolvedValue(expectedResult);

      const result = await resolver.getMessages(conversation, user);

      expect(mockMessagesService.findAll).toHaveBeenCalledWith(
        conversation.id,
        user.userId,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});