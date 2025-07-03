import { Test, TestingModule } from '@nestjs/testing';
import { MessagesGateway } from './messages.gateway';
import { ConversationsService } from '../conversations/conversations.service';
import { UnauthorizedException } from '@nestjs/common';
import { Server } from 'socket.io';
import { CreateMessageInput } from './dto/create-message.input';

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let conversationsService: ConversationsService;
  let mockServer: Partial<Server>;
  let mockClient: any;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      handshake: { auth: {} },
      join: jest.fn(),
      leave: jest.fn(),
      id: 'mockClientId',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesGateway,
        {
          provide: ConversationsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<MessagesGateway>(MessagesGateway);
    conversationsService = module.get<ConversationsService>(ConversationsService);
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinConversation', () => {
    it('should throw UnauthorizedException if userId is missing', async () => {
      mockClient.handshake.auth.userId = undefined;
      await expect(gateway.handleJoinConversation('conv1', mockClient)).rejects.toThrow(UnauthorizedException);
      await expect(gateway.handleJoinConversation('conv1', mockClient)).rejects.toThrow('Authentication required for WebSocket.');
    });

    it('should throw UnauthorizedException if conversation not found or access denied', async () => {
      mockClient.handshake.auth.userId = 'user1';
      jest.spyOn(conversationsService, 'findOne').mockResolvedValue(null);

      await expect(gateway.handleJoinConversation('conv1', mockClient)).rejects.toThrow(UnauthorizedException);
      await expect(gateway.handleJoinConversation('conv1', mockClient)).rejects.toThrow('Conversation not found or access denied.');
    });

    it('should join the conversation if successful', async () => {
      mockClient.handshake.auth.userId = 'user1';
      const mockConversation = { id: 'conv1', clerkUserIds: ['user1'] };
      jest.spyOn(conversationsService, 'findOne').mockResolvedValue(mockConversation as any);

      await gateway.handleJoinConversation('conv1', mockClient);

      expect(conversationsService.findOne).toHaveBeenCalledWith('conv1', 'user1');
      expect(mockClient.join).toHaveBeenCalledWith('conv1');
    });
  });

  describe('handleLeaveConversation', () => {
    it('should leave the conversation', () => {
      gateway.handleLeaveConversation('conv1', mockClient);
      expect(mockClient.leave).toHaveBeenCalledWith('conv1');
    });
  });

  describe('sendNewMessage', () => {
    it('should emit newMessage to the correct conversation room', () => {
      const message: CreateMessageInput & { id: string; senderId: string } = {
        id: 'msg1',
        content: 'Test message',
        conversationId: 'conv1',
        senderId: 'user1',
      };

      gateway.sendNewMessage(message);

      expect(mockServer.to).toHaveBeenCalledWith('conv1');
      expect(mockServer.emit).toHaveBeenCalledWith('newMessage', message);
    });
  });
});