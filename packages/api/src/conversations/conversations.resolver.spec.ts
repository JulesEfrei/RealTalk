import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsResolver } from './conversations.resolver';
import { ConversationsService } from './conversations.service';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { CreateConversationInput } from './dto/create-conversation.input';
import { UpdateConversationInput } from './dto/update-conversation.input';
import { Conversation } from './models/conversation.model';
import { Message } from '../messages/models/message.model';
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

describe('ConversationsResolver', () => {
  let resolver: ConversationsResolver;
  let conversationsService: ConversationsService;
  let messagesService: MessagesService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsResolver,
        {
          provide: ConversationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: MessagesService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUsersByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<ConversationsResolver>(ConversationsResolver);
    conversationsService =
      module.get<ConversationsService>(ConversationsService);
    messagesService = module.get<MessagesService>(MessagesService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a conversation and add clerkUserId if not present', async () => {
      const createConversationInput: CreateConversationInput = {
        title: 'Test Conversation',
        userIds: ['user1'],
      };
      const expectedConversation: Conversation = {
        id: '1',
        title: 'Test Conversation',
        users: ['user1', 'mockUserId'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };
      jest
        .spyOn(conversationsService, 'create')
        .mockResolvedValue(expectedConversation);

      const result = await resolver.createConversation(
        createConversationInput,
        { userId: 'mockUserId' } as IAuthUser,
      );

      expect(createConversationInput.userIds).toContain('mockUserId');
      expect(conversationsService.create).toHaveBeenCalledWith(
        createConversationInput,
      );
      expect(result).toEqual(expectedConversation);
    });

    it('should create a conversation without adding clerkUserId if already present', async () => {
      const createConversationInput: CreateConversationInput = {
        title: 'Test Conversation',
        userIds: ['user1', 'mockUserId'],
      };
      const expectedConversation: Conversation = {
        id: '1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'mockUserId'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        users: [],
      };
      jest
        .spyOn(conversationsService, 'create')
        .mockResolvedValue(expectedConversation);

      const result = await resolver.createConversation(
        createConversationInput,
        { userId: 'mockUserId' } as IAuthUser,
      );

      expect(createConversationInput.userIds).toEqual(['user1', 'mockUserId']);
      expect(conversationsService.create).toHaveBeenCalledWith(
        createConversationInput,
      );
      expect(result).toEqual(expectedConversation);
    });
  });

  describe('getUsers', () => {
    it('should return users for a given conversation', async () => {
      const conversation: Conversation & { clerkUserIds: string[] } = {
        id: '1',
        title: 'Test Conversation',
        clerkUserIds: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        users: [],
      };
      const expectedUsers: User[] = [
        { id: 'user1', name: 'User 1', avatar: '' },
        { id: 'user2', name: 'User 2', avatar: '' },
      ];
      jest
        .spyOn(usersService, 'findUsersByIds')
        .mockResolvedValue(expectedUsers);

      const result = await resolver.getUsers(conversation);

      expect(usersService.findUsersByIds).toHaveBeenCalledWith(
        conversation.clerkUserIds,
      );
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findAll', () => {
    it('should return all conversations for a user', async () => {
      const expectedConversations: Conversation[] = [
        {
          id: '1',
          title: 'Test Conversation',
          clerkUserIds: ['mockUserId'],
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
          users: [],
        },
      ];
      jest
        .spyOn(conversationsService, 'findAll')
        .mockResolvedValue(expectedConversations);

      const result = await resolver.findAll({
        userId: 'mockUserId',
      } as IAuthUser);

      expect(conversationsService.findAll).toHaveBeenCalledWith('mockUserId');
      expect(result).toEqual(expectedConversations);
    });
  });

  describe('findOne', () => {
    it('should return a single conversation by ID', async () => {
      const expectedConversation: Conversation = {
        id: '1',
        title: 'Test Conversation',
        clerkUserIds: ['mockUserId'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        users: [],
      };
      jest
        .spyOn(conversationsService, 'findOne')
        .mockResolvedValue(expectedConversation);

      const result = await resolver.findOne('1', {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(conversationsService.findOne).toHaveBeenCalledWith(
        '1',
        'mockUserId',
      );
      expect(result).toEqual(expectedConversation);
    });
  });

  describe('updateConversation', () => {
    it('should update a conversation', async () => {
      const updateConversationInput: UpdateConversationInput = {
        id: '1',
        title: 'Updated Name',
      };
      const expectedConversation: Conversation = {
        id: '1',
        title: 'Updated Name',
        clerkUserIds: ['mockUserId'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(conversationsService, 'update')
        .mockResolvedValue(expectedConversation);

      const result = await resolver.updateConversation(
        updateConversationInput,
        { userId: 'mockUserId' } as IAuthUser,
      );

      expect(conversationsService.update).toHaveBeenCalledWith(
        updateConversationInput,
        'mockUserId',
      );
      expect(result).toEqual(expectedConversation);
    });
  });

  describe('removeConversation', () => {
    it('should remove a conversation', async () => {
      const expectedConversation: Conversation = {
        id: '1',
        title: 'Test Conversation',
        clerkUserIds: ['mockUserId'],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        users: [],
      };
      jest
        .spyOn(conversationsService, 'remove')
        .mockResolvedValue(expectedConversation);

      const result = await resolver.removeConversation('1', {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(conversationsService.remove).toHaveBeenCalledWith(
        '1',
        'mockUserId',
      );
      expect(result).toEqual(expectedConversation);
    });
  });

  describe('getMessages', () => {
    it('should return messages for a given conversation', async () => {
      const conversation: Conversation = {
        id: '1',
        title: 'Test Conversation',
        users: [],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedMessages: Message[] = [
        {
          id: 'msg1',
          content: 'Hello',
          conversationId: '1',
          sender: { id: 'mockUserId', name: 'Mock User', avatar: '' } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
          conversation: {} as Conversation,
        },
      ];
      jest
        .spyOn(messagesService, 'findAll')
        .mockResolvedValue(expectedMessages);

      const result = await resolver.getMessages(conversation, {
        userId: 'mockUserId',
      } as IAuthUser);

      expect(messagesService.findAll).toHaveBeenCalledWith(
        conversation.id,
        'mockUserId',
      );
      expect(result).toEqual(expectedMessages);
    });
  });
});
