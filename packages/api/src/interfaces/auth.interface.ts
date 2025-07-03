import { AuthObject } from '@clerk/backend';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthObject;
    }
  }
}

export interface IAuthUser {
  userId: string;
  sessionId?: string;
  orgId?: string;
}
