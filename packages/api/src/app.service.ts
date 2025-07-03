import { clerkClient } from '@clerk/express';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const user = await clerkClient.users.getUserList();

    return JSON.stringify({ user });
  }
}
