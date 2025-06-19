import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthUser } from '../interfaces/auth.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof IAuthUser | undefined, ctx: ExecutionContext): IAuthUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    const auth = request.auth;

    if (!auth ||!auth.userId) {
      return undefined;
    }

    const user: IAuthUser = {
      userId: auth.userId,
      sessionId: auth.sessionId,
      orgId: auth.orgId,
    };

    if (data) {
      return user[data];
    }

    return user;
  },
);