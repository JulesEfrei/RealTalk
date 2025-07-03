import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MessageConsumer } from 'src/messages/message.consumer';
import { MessagesModule } from 'src/messages/messages.module';

const rabbitMQClientConfig = ClientsModule.registerAsync([
  {
    name: 'RABBITMQ_SERVICE',
    useFactory: (configService: ConfigService) => ({
      transport: Transport.RMQ,
      options: {
        urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
        queue: 'messages_queue',
        queueOptions: {
          durable: true,
        },
        noAck: true,
      },
    }),
    inject: [ConfigService],
  },
]);

@Module({
  controllers: [MessageConsumer],
  imports: [rabbitMQClientConfig, forwardRef(() => MessagesModule)],
  exports: [rabbitMQClientConfig],
})
export class RabbitMQModule {}
