import { clerkClient } from '@clerk/express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const user = await clerkClient.users.getUserList();

    return JSON.stringify({ user });
  }
}
