import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GraphQL API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  const TEST_USER_ID = 'test-user-id';
  let testConversationId: string;
  let testMessageId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard('ClerkAuthGuard')
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    
    // Mock the Clerk middleware
    app.use((req, res, next) => {
      req.auth = { userId: TEST_USER_ID };
      req.clerkAuth = { userId: TEST_USER_ID };
      next();
    });
    
    await app.init();

    // Clean up the database before tests
    await prismaService.message.deleteMany();
    await prismaService.conversation.deleteMany();
  });

  afterAll(async () => {
    // Clean up the database after tests
    await prismaService.message.deleteMany();
    await prismaService.conversation.deleteMany();
    await app.close();
  });

  describe('Conversations', () => {
    it('should create a conversation', async () => {
      const createConversationMutation = `
        mutation {
          createConversation(createConversationInput: {
            title: "Test Conversation",
            clerkUserIds: ["${TEST_USER_ID}", "other-user-id"]
          }) {
            id
            title
            clerkUserIds
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createConversationMutation,
        })
        .expect(200);

      expect(response.body.data.createConversation).toBeDefined();
      expect(response.body.data.createConversation.title).toBe('Test Conversation');
      expect(response.body.data.createConversation.clerkUserIds).toContain(TEST_USER_ID);
      expect(response.body.data.createConversation.clerkUserIds).toContain('other-user-id');

      // Save the conversation ID for later tests
      testConversationId = response.body.data.createConversation.id;
    });

    it('should query all conversations', async () => {
      const conversationsQuery = `
        query {
          conversations {
            id
            title
            clerkUserIds
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: conversationsQuery,
        })
        .expect(200);

      expect(response.body.data.conversations).toBeDefined();
      expect(Array.isArray(response.body.data.conversations)).toBe(true);
      expect(response.body.data.conversations.length).toBeGreaterThan(0);
      expect(response.body.data.conversations[0].id).toBe(testConversationId);
    });

    it('should query a single conversation', async () => {
      const conversationQuery = `
        query {
          conversation(id: "${testConversationId}") {
            id
            title
            clerkUserIds
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: conversationQuery,
        })
        .expect(200);

      expect(response.body.data.conversation).toBeDefined();
      expect(response.body.data.conversation.id).toBe(testConversationId);
      expect(response.body.data.conversation.title).toBe('Test Conversation');
    });

    it('should update a conversation', async () => {
      const updateConversationMutation = `
        mutation {
          updateConversation(updateConversationInput: {
            id: "${testConversationId}",
            title: "Updated Test Conversation"
          }) {
            id
            title
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: updateConversationMutation,
        })
        .expect(200);

      expect(response.body.data.updateConversation).toBeDefined();
      expect(response.body.data.updateConversation.id).toBe(testConversationId);
      expect(response.body.data.updateConversation.title).toBe('Updated Test Conversation');
    });
  });

  describe('Messages', () => {
    it('should create a message', async () => {
      const createMessageMutation = `
        mutation {
          createMessage(createMessageInput: {
            conversationId: "${testConversationId}",
            content: "Test Message",
            senderId: "${TEST_USER_ID}"
          }) {
            id
            conversationId
            content
            senderId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createMessageMutation,
        })
        .expect(200);

      expect(response.body.data.createMessage).toBeDefined();
      expect(response.body.data.createMessage.conversationId).toBe(testConversationId);
      expect(response.body.data.createMessage.content).toBe('Test Message');
      expect(response.body.data.createMessage.senderId).toBe(TEST_USER_ID);

      // Save the message ID for later tests
      testMessageId = response.body.data.createMessage.id;
    });

    it('should query all messages for a conversation', async () => {
      const messagesQuery = `
        query {
          messages(conversationId: "${testConversationId}") {
            id
            content
            senderId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: messagesQuery,
        })
        .expect(200);

      expect(response.body.data.messages).toBeDefined();
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBeGreaterThan(0);
      expect(response.body.data.messages[0].id).toBe(testMessageId);
      expect(response.body.data.messages[0].content).toBe('Test Message');
    });

    it('should query a single message', async () => {
      const messageQuery = `
        query {
          message(id: "${testMessageId}") {
            id
            content
            senderId
            conversationId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: messageQuery,
        })
        .expect(200);

      expect(response.body.data.message).toBeDefined();
      expect(response.body.data.message.id).toBe(testMessageId);
      expect(response.body.data.message.content).toBe('Test Message');
      expect(response.body.data.message.conversationId).toBe(testConversationId);
    });
  });

  describe('Cleanup', () => {
    it('should remove a message', async () => {
      const removeMessageMutation = `
        mutation {
          removeMessage(id: "${testMessageId}") {
            id
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: removeMessageMutation,
        })
        .expect(200);

      expect(response.body.data.removeMessage).toBeDefined();
      expect(response.body.data.removeMessage.id).toBe(testMessageId);
    });

    it('should remove a conversation', async () => {
      const removeConversationMutation = `
        mutation {
          removeConversation(id: "${testConversationId}") {
            id
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: removeConversationMutation,
        })
        .expect(200);

      expect(response.body.data.removeConversation).toBeDefined();
      expect(response.body.data.removeConversation.id).toBe(testConversationId);
    });
  });
});