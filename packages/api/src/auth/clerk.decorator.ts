import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IAuthUser } from 'src/interfaces/auth.interface';

export const ClerkAuth = createParamDecorator(
  (data: IAuthUser | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();

    if (
      !gqlContext ||
      typeof gqlContext !== 'object' ||
      !('req' in gqlContext) ||
      !gqlContext.req
    ) {
      throw new Error('Request object not found in GraphQL context');
    }

    const request = gqlContext.req as { auth?: IAuthUser };

    const auth: IAuthUser | undefined = request.auth;

    if (!auth || !auth.userId) {
      throw new Error('User not authenticated');
    }

    const user: IAuthUser = {
      userId: auth.userId,
      sessionId: auth.sessionId,
      orgId: auth.orgId,
    };

    if (data) {
      return data;
    }

    return user;
  },
);
