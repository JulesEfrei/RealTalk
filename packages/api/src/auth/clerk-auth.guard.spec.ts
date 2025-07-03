import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

// Mock @clerk/express getAuth
jest.mock('@clerk/express', () => ({
  getAuth: jest.fn((req) => req.auth),
}));

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  let reflector: Reflector;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        Reflector,
        Logger,
      ],
    }).compile();

    guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
    reflector = module.get<Reflector>(Reflector);
    logger = module.get<Logger>(Logger);
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

      jest.spyOn(logger, 'debug').mockImplementation(() => {});
    });

    it('should return true if the route is public', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      expect(await guard.canActivate(context)).toBe(true);
    });

    describe('HTTP Context', () => {
      beforeEach(() => {
        jest.spyOn(context, 'getType').mockReturnValue('http');
      });

      it('should return true and set auth on request if authenticated', async () => {
        const mockRequest = { auth: { userId: 'user123' } };
        jest.spyOn(context.switchToHttp(), 'getRequest').mockReturnValue(mockRequest);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(await guard.canActivate(context)).toBe(true);
        expect(mockRequest.auth).toEqual({ userId: 'user123' });
      });

      it('should throw UnauthorizedException if not authenticated', async () => {
        const mockRequest = { auth: null };
        jest.spyOn(context.switchToHttp(), 'getRequest').mockReturnValue(mockRequest);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        await expect(guard.canActivate(context)).rejects.toThrow('Authentication required.');
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

      it('should return true and set auth on request if authenticated', async () => {
        const mockRequest = { auth: { userId: 'user123' }, headers: {} };
        jest.spyOn(gqlContext, 'getContext').mockReturnValue({ req: mockRequest });
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(await guard.canActivate(context)).toBe(true);
        expect(mockRequest.auth).toEqual({ userId: 'user123' });
      });

      it('should throw UnauthorizedException if not authenticated', async () => {
        const mockRequest = { auth: null, headers: {} };
        jest.spyOn(gqlContext, 'getContext').mockReturnValue({ req: mockRequest });
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        await expect(guard.canActivate(context)).rejects.toThrow('Authentication required for GraphQL.');
      });
    });
  });
});
