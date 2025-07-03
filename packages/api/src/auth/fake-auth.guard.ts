import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getAuth } from '@clerk/express';
import { IAuthUser } from '../interfaces/auth.interface';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class FakeAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: Logger = new Logger(FakeAuthGuard.name),
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Make the `/health` endpoint public thanks to the @Public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>();

      try {
        const auth = await getAuth(request);

        if (auth && auth.userId) {
          request.auth = auth;
          return true;
        }
      } catch (error) {
        // Clerk connection not available, proceed with fake auth
        console.warn(
          'Clerk authentication failed, using fake auth:',
          error.message,
        );
      }
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req;

      try {
        const auth = await getAuth(request);

        if (auth && auth.userId) {
          request.auth = auth;
          return true;
        }
      } catch (error) {
        // Clerk connection not available, proceed with fake auth
        this.logger.debug(
          'Clerk authentication failed, using fake auth:',
          error.message,
        );
      }

      if (process.env.NODE_ENV === 'production') {
        throw new Error('FakeAuthGuard should not be used in production');
      }

      const fakeUser: IAuthUser = {
        userId:
          process.env.CLERK_TEST_USER_ID || 'user_2yiwBHfjPNhFx1rMpmR71QqNlpj',
      };

      request.auth = fakeUser;

      return true;
    }

    return false;
  }
}
