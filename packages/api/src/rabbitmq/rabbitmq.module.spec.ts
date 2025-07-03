import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQModule } from './rabbitmq.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

describe('RabbitMQModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ClientsModule.registerAsync([
          {
            name: 'RABBITMQ_SERVICE',
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [
                  configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
                ],
                queue: 'messages_queue',
                queueOptions: {
                  durable: true,
                },
                noAck: false,
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [ConfigService],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide RABBITMQ_SERVICE client', () => {
    const client = module.get('RABBITMQ_SERVICE');
    expect(client).toBeDefined();
  });
});
