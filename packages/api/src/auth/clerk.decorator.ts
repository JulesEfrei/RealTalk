import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IAuthUser } from 'src/interfaces/auth.interface';

export const ClerkAuth = createParamDecorator(
  (data: IAuthUser | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const auth = request.auth;

    if (!auth) {
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
