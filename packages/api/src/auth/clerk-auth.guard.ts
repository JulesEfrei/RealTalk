import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { getAuth, type SessionAuthObject } from '@clerk/express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

// Define a type for request with auth property
type RequestWithAuth = Request & { auth?: SessionAuthObject };

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: Logger = new Logger(ClerkAuthGuard.name),
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

      const auth = getAuth(request) as SessionAuthObject | null;

      this.logger.debug('HTTP Request Auth:', {
        hasAuth: !!auth,
        userId: auth?.userId,
      });

      if (!auth || !auth.userId) {
        throw new UnauthorizedException('Authentication required.');
      }

      request.auth = auth;
      return true;
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();

      if (!ctx || typeof ctx !== 'object' || !('req' in ctx) || !ctx.req) {
        throw new UnauthorizedException(
          'No request object found in GraphQL context',
        );
      }

      const request = ctx.req as RequestWithAuth;

      this.logger.debug('GraphQL Request:', {
        hasReq: !!request,
        headers: request && request.headers ? 'present' : 'absent',
        authorization:
          request && request.headers && request.headers.authorization
            ? 'present'
            : 'absent',
      });

      const auth = getAuth(request) as SessionAuthObject | null;

      this.logger.debug('GraphQL Auth:', {
        hasAuth: !!auth,
        userId: auth?.userId,
      });

      if (!auth || !auth.userId) {
        throw new UnauthorizedException('Authentication required for GraphQL.');
      }

      request.auth = auth;
      return true;
    }
  }
}
