import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async publishMessage(pattern: string, data: any) {
    try {
      this.logger.log(`Publishing message with pattern: ${pattern}`);
      this.logger.log(`Message data: ${JSON.stringify(data)}`);

      this.client.emit(pattern, data);
      return { success: true, pattern, timestamp: new Date() };
    } catch (error) {
      this.logger.error(
        `Error publishing message: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async onApplicationBootstrap() {
    await this.client.connect();
    this.logger.log('RabbitMQ client connected successfully');
  }
}
