import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessagesGateway } from './messages.gateway';

@Controller()
export class MessageConsumer {
  constructor(private messagesGateway: MessagesGateway) {}
  private readonly logger = new Logger(MessageConsumer.name);

  @EventPattern('message_created')
  async handleMessageCreated(
    @Payload()
    message: {
      id: string;
      conversationId: string;
      content: string;
      senderId: string;
      createdAt: Date;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as {
      ack: (msg: unknown) => void;
      nack: (msg: unknown, allUpTo: boolean, requeue: boolean) => void;
    };
    const originalMsg = context.getMessage();

    try {
      await this.messagesGateway.sendNewMessage(message);
      this.logger.debug(`Message ${message.id} processed successfully`);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Failed to process message ${message.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      channel.nack(originalMsg, false, true);
    }

    this.logger.debug('Message created!');
  }
}
