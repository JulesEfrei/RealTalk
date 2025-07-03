import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

describe('UsersModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UsersService', () => {
    const usersService = module.get<UsersService>(UsersService);
    expect(usersService).toBeDefined();
  });

  it('should provide UsersResolver', () => {
    const usersResolver = module.get<UsersResolver>(UsersResolver);
    expect(usersResolver).toBeDefined();
  });
});
