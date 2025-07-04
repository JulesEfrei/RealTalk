import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getAuth } from '@clerk/express';
// IAuthUser no longer used as we're using AuthObject directly
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { Request } from 'express';
import { AuthObject } from '@clerk/backend';

// Define a type for request with auth property
type RequestWithAuth = Request & { auth?: AuthObject };

@Injectable()
export class FakeAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: Logger = new Logger(FakeAuthGuard.name),
  ) {}

  canActivate(context: ExecutionContext): boolean {
    //Make the `/health` endpoint public thanks to the @Public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<RequestWithAuth>();

      try {
        const auth = getAuth(request);

        if (auth && auth.userId) {
          request.auth = auth;
          return true;
        }
      } catch (error: unknown) {
        // Clerk connection not available, proceed with fake auth
        console.warn(
          'Clerk authentication failed, using fake auth:',
          error instanceof Error ? error.message : String(error),
        );
      }
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      const gqlContextObj = gqlContext.getContext();

      if (
        !gqlContextObj ||
        typeof gqlContextObj !== 'object' ||
        !('req' in gqlContextObj) ||
        !gqlContextObj.req
      ) {
        this.logger.debug('No request object found in GraphQL context');
        return false;
      }

      const request = gqlContextObj.req as RequestWithAuth;

      try {
        const auth = getAuth(request);

        if (auth && auth.userId) {
          request.auth = auth;
          return true;
        }
      } catch (error: unknown) {
        // Clerk connection not available, proceed with fake auth
        this.logger.debug(
          'Clerk authentication failed, using fake auth:',
          error instanceof Error ? error.message : String(error),
        );
      }

      if (process.env.NODE_ENV === 'production') {
        throw new Error('FakeAuthGuard should not be used in production');
      }

      // Create a fake AuthObject that satisfies the required interface
      const fakeUser = {
        userId:
          process.env.CLERK_TEST_USER_ID || 'user_2yiwBHfjPNhFx1rMpmR71QqNlpj',
        isAuthenticated: true,
        tokenType: 'session_token',
        getToken: () => Promise.resolve('fake-token'),
        has: () => true,
        debug: () => ({}),
        sessionClaims: {}, // Add sessionClaims to satisfy JwtPayload requirement
      } as unknown as AuthObject;

      request.auth = fakeUser;

      return true;
    }

    return false;
  }
}
