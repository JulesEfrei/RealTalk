import { AuthObject } from '@clerk/backend';

// Extend Express Request interface using module augmentation
declare module 'express' {
  interface Request {
    auth?: AuthObject;
  }
}

export interface IAuthUser {
  userId: string;
  sessionId?: string;
  orgId?: string;
}
