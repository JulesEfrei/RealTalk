import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { MessageConsumer } from './message.consumer';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const host =
            process.env.NODE_ENV === 'production' ? 'rabbitmq' : 'localhost';
          return {
            transport: Transport.RMQ,
            options: {
              urls: [
                `amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASSWORD')}@${host}:${configService.get('RABBITMQ_PORT')}`,
              ],
              queue: 'messages_queue',
              queueOptions: {
                durable: true,
              },
              noAck: true,
              prefetchCount: 1,
              isGlobalPrefetchCount: false,
            },
          };
        },
      },
    ]),
  ],
  controllers: [MessageConsumer],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
