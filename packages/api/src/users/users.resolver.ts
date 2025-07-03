import { Resolver, Query, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { InternalServerErrorException } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'user' })
  async getUser(@Args('id') id: string): Promise<User | null> {
    try {
      return this.usersService.findUserById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  @Query(() => [User], { name: 'users' })
  async getUsers(
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<User[]> {
    try {
      return this.usersService.findUsersByIds(ids);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
}
