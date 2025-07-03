import { Injectable } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  async findUserById(userId: string): Promise<User | null> {
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      return {
        id: clerkUser.id,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatar: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0].emailAddress,
        initials:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName[0]}${clerkUser.lastName[0]}`
            : clerkUser.emailAddresses[0]?.emailAddress?.slice(0, 2) || 'NA',
      };
    } catch (error) {
      console.error(`Error fetching user ${userId} from Clerk:`, error);
      return null;
    }
  }

  async findUsersByIds(userIds: string[]): Promise<User[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const validUserIds = userIds.filter((id) => id && typeof id === 'string');
    if (validUserIds.length === 0) {
      return [];
    }

    try {
      const clerkUsers = await clerkClient.users.getUserList({
        userId: validUserIds,
      });
      return clerkUsers.data.map((clerkUser) => ({
        id: clerkUser.id,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatar: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0].emailAddress,
        initials:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName[0]}${clerkUser.lastName[0]}`
            : clerkUser.emailAddresses[0].emailAddress.slice(0, 2),
      }));
    } catch (error) {
      console.error('Error fetching users from Clerk:', error);
      return [];
    }
  }
}
