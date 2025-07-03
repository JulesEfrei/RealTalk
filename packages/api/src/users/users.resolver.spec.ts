import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { User } from './models/user.model';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: {
            findUserById: jest.fn(),
            findUsersByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const userId = 'user1';
      const expectedUser: User = { id: userId, name: 'Test User', avatar: '' };
      jest.spyOn(usersService, 'findUserById').mockResolvedValue(expectedUser);

      const result = await resolver.getUser(userId);

      expect(usersService.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistentUser';
      jest.spyOn(usersService, 'findUserById').mockResolvedValue(null);

      const result = await resolver.getUser(userId);

      expect(usersService.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('getUsers', () => {
    it('should return a list of users by IDs', async () => {
      const userIds = ['user1', 'user2'];
      const expectedUsers: User[] = [
        { id: 'user1', name: 'User One', avatar: '' },
        { id: 'user2', name: 'User Two', avatar: '' },
      ];
      jest.spyOn(usersService, 'findUsersByIds').mockResolvedValue(expectedUsers);

      const result = await resolver.getUsers(userIds);

      expect(usersService.findUsersByIds).toHaveBeenCalledWith(userIds);
      expect(result).toEqual(expectedUsers);
    });

    it('should return an empty array if no users found', async () => {
      const userIds: string[] = [];
      jest.spyOn(usersService, 'findUsersByIds').mockResolvedValue([]);

      const result = await resolver.getUsers(userIds);

      expect(usersService.findUsersByIds).toHaveBeenCalledWith(userIds);
      expect(result).toEqual([]);
    });
  });
});
