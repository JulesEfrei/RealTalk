import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  app.use(clerkMiddleware());

  const configService = app.get(ConfigService);

  const host = process.env.NODE_ENV === 'production' ? 'rabbitmq' : 'localhost';
  logger.log(
    `Connecting RabbitMQ consumer to ${host}:${configService.get('RABBITMQ_PORT')}`,
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASSWORD')}@${host}:${configService.get('RABBITMQ_PORT')}`,
      ],
      queue: 'messages_queue',
      queueOptions: { durable: true },
      noAck: true,
    },
  });

  await app.startAllMicroservices();
  logger.log('RabbitMQ consumer started');

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application started on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
