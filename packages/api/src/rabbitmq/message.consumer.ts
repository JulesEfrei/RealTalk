import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);

  @EventPattern('message.created')
  async handleMessageCreated(@Payload() data: any) {
    this.logger.log('-------------------------------------');
    this.logger.log('MESSAGE RECEIVED FROM RABBITMQ QUEUE');
    this.logger.log(`Pattern: message.created`);
    this.logger.log(`Data: ${JSON.stringify(data, null, 2)}`);
    
    this.logger.log('Message processed (noAck mode)');
    this.logger.log('-------------------------------------');
  }
}
