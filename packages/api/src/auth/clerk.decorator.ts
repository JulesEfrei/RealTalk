import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const ClerkAuth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    // L'ID de l'utilisateur est attaché à la requête par le middleware Clerk ou notre garde
    if (request.clerkAuth && request.clerkAuth.userId) {
      return request.clerkAuth.userId;
    } else if (request.auth && request.auth.userId) {
      return request.auth.userId;
    } else {
      throw new Error('User not authenticated');
    }
  },
);
