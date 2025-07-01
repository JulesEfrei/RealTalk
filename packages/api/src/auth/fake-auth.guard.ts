import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getAuth } from '@clerk/express';
import { IAuthUser } from '../interfaces/auth.interface';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class FakeAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Make the `/health` endpoint public thanks to the @Public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    try {
      const auth = await getAuth(request);
      if (auth && auth.userId) {
        const user: IAuthUser = {
          userId: auth.userId,
          sessionId: auth.sessionId,
          orgId: auth.orgId,
        };
        request.auth = user;
        return true;
      }
    } catch (error) {
      // Clerk connection not available, proceed with fake auth
    }

    const fakeUser: IAuthUser = {
      userId:
        process.env.CLERK_TEST_USER_ID || 'user_2yiwBHfjPNhFx1rMpmR71QqNlpj',
    };

    request.auth = fakeUser;

    return true;
  }
}
