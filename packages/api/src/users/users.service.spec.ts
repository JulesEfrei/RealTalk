import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { User } from './models/user.model';

jest.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
      getUserList: jest.fn(),
    },
  },
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const mockClerkUser = {
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'http://example.com/avatar.jpg',
      };
      (clerkClient.users.getUser as jest.Mock).mockResolvedValue(mockClerkUser);

      const expectedUser: User = {
        id: 'user123',
        name: 'John Doe',
        avatar: 'http://example.com/avatar.jpg',
      };

      const result = await service.findUserById('user123');
      expect(result).toEqual(expectedUser);
      expect(clerkClient.users.getUser).toHaveBeenCalledWith('user123');
    });

    it('should return null if user not found or error occurs', async () => {
      (clerkClient.users.getUser as jest.Mock).mockRejectedValue(new Error('User not found'));
      jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console error

      const result = await service.findUserById('nonexistentUser');
      expect(result).toBeNull();
      expect(clerkClient.users.getUser).toHaveBeenCalledWith('nonexistentUser');
    });
  });

  describe('findUsersByIds', () => {
    it('should return a list of users if found', async () => {
      const mockClerkUsers = [
        {
          id: 'user1',
          firstName: 'Alice',
          lastName: 'Smith',
          imageUrl: 'http://example.com/alice.jpg',
        },
        {
          id: 'user2',
          firstName: 'Bob',
          lastName: 'Johnson',
          imageUrl: 'http://example.com/bob.jpg',
        },
      ];
      (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({ data: mockClerkUsers });

      const expectedUsers: User[] = [
        {
          id: 'user1',
          name: 'Alice Smith',
          avatar: 'http://example.com/alice.jpg',
        },
        {
          id: 'user2',
          name: 'Bob Johnson',
          avatar: 'http://example.com/bob.jpg',
        },
      ];

      const result = await service.findUsersByIds(['user1', 'user2']);
      expect(result).toEqual(expectedUsers);
      expect(clerkClient.users.getUserList).toHaveBeenCalledWith({ userId: ['user1', 'user2'] });
    });

    it('should return an empty array if no users found or error occurs', async () => {
      (clerkClient.users.getUserList as jest.Mock).mockRejectedValue(new Error('No users found'));
      jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console error

      const result = await service.findUsersByIds(['nonexistentUser']);
      expect(result).toEqual([]);
      expect(clerkClient.users.getUserList).toHaveBeenCalledWith({ userId: ['nonexistentUser'] });
    });
  });
});
