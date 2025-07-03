import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL! ||
          (() => {
            throw new Error('RABBITMQ_URL environment variable is required');
          })(),
      ],
      queue: 'messages_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });
  await app.startAllMicroservices();
  app.use(clerkMiddleware());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
