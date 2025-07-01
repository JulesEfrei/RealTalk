import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { getAuth } from '@clerk/express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

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
      const auth = getAuth(request);

      console.log('HTTP Request Auth:', {
        hasAuth: !!auth,
        userId: auth?.userId,
        headers: request.headers,
      });

      if (!auth || !auth.userId) {
        throw new UnauthorizedException('Authentication required.');
      }

      request.auth = auth;
      return true;
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req;

      console.log('GraphQL Request:', {
        hasReq: !!request,
        headers: request?.headers,
        authorization: request?.headers?.authorization,
      });

      const auth = getAuth(request);
      console.log(auth);

      console.log('GraphQL Auth:', { hasAuth: !!auth, userId: auth?.userId });

      if (!auth || !auth.userId) {
        throw new UnauthorizedException('Authentication required for GraphQL.');
      }

      request.auth = auth;
      return true;
    }
  }
}
