import { Test, TestingModule } from '@nestjs/testing';
import { FakeAuthGuard } from './fake-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

// Mock @clerk/express getAuth
jest.mock('@clerk/express', () => ({
  getAuth: jest.fn((req) => req.auth),
}));

describe('FakeAuthGuard', () => {
  let guard: FakeAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FakeAuthGuard,
        Reflector,
      ],
    }).compile();

    guard = module.get<FakeAuthGuard>(FakeAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;

    beforeEach(() => {
      context = {
        getHandler: () => ({}),
        getClass: () => ({}),
        getType: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({}),
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should return true if the route is public', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      expect(await guard.canActivate(context)).toBe(true);
    });

    describe('HTTP Context', () => {
      beforeEach(() => {
        jest.spyOn(context, 'getType').mockReturnValue('http');
      });

      it('should return true and set auth on request if Clerk auth succeeds', async () => {
        const mockRequest = { auth: { userId: 'clerk_user' } };
        jest.spyOn(context.switchToHttp(), 'getRequest').mockReturnValue(mockRequest);
        require('@clerk/express').getAuth.mockResolvedValue({ userId: 'clerk_user' });

        expect(await guard.canActivate(context)).toBe(true);
        expect(mockRequest.auth).toEqual({ userId: 'clerk_user' });
      });

      it('should use fake auth if Clerk auth fails and set auth on request', async () => {
        const mockRequest = { auth: null };
        jest.spyOn(context.switchToHttp(), 'getRequest').mockReturnValue(mockRequest);
        require('@clerk/express').getAuth.mockRejectedValue(new Error('Clerk error'));

        process.env.NODE_ENV = 'development';
        process.env.CLERK_TEST_USER_ID = 'fake_user_id';

        expect(await guard.canActivate(context)).toBe(true);
        expect(mockRequest.auth).toEqual({ userId: 'fake_user_id' });
      });

      it('should throw an error in production if Clerk auth fails', async () => {
        const mockRequest = { auth: null };
        jest.spyOn(context.switchToHttp(), 'getRequest').mockReturnValue(mockRequest);
        require('@clerk/express').getAuth.mockRejectedValue(new Error('Clerk error'));

        process.env.NODE_ENV = 'production';

        await expect(guard.canActivate(context)).rejects.toThrow('FakeAuthGuard should not be used in production');
      });
    });

    describe('GraphQL Context', () => {
      let gqlContext: GqlExecutionContext;

      beforeEach(() => {
        jest.spyOn(context, 'getType').mockReturnValue('graphql');
        gqlContext = {
          getContext: () => ({ req: {} }),
          getArgs: () => ({}),
          getRoot: () => ({}),
          getInfo: () => ({}),
        } as unknown as GqlExecutionContext;
        jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlContext);
      });

      it('should return true and set auth on request if Clerk auth succeeds', async () => {
        const mockRequest = { auth: { userId: 'clerk_user_gql' }, headers: {} };
        jest.spyOn(gqlContext, 'getContext').mockReturnValue({ req: mockRequest });
        require('@clerk/express').getAuth.mockResolvedValue({ userId: 'clerk_user_gql' });

        expect(await guard.canActivate(context)).toBe(true);
        expect(mockRequest.auth).toEqual({ userId: 'clerk_user_gql' });
      });

      it('should use fake auth if Clerk auth fails and set auth on request', async () => {
        const mockRequest = { auth: null, headers: {} };
        jest.spyOn(gqlContext, 'getContext').mockReturnValue({ req: mockRequest });
        require('@clerk/express').getAuth.mockRejectedValue(new Error('Clerk error'));

        process.env.NODE_ENV = 'development';
        process.env.CLERK_TEST_USER_ID = 'fake_user_id_gql';

        expect(await guard.canActivate(context)).toBe(true);
        expect(mockRequest.auth).toEqual({ userId: 'fake_user_id_gql' });
      });

      it('should throw an error in production if Clerk auth fails', async () => {
        const mockRequest = { auth: null, headers: {} };
        jest.spyOn(gqlContext, 'getContext').mockReturnValue({ req: mockRequest });
        require('@clerk/express').getAuth.mockRejectedValue(new Error('Clerk error'));

        process.env.NODE_ENV = 'production';

        await expect(guard.canActivate(context)).rejects.toThrow('FakeAuthGuard should not be used in production');
      });
    });
  });
});
