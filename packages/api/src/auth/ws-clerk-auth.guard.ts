import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
// IncomingMessage is not used in this file
import { Socket } from 'socket.io';

@Injectable()
export class WsClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context
      .switchToWs()
      .getClient<
        Socket & { handshake: { auth: { token?: string; userId?: string } } }
      >();

    if (!client || !client.handshake || !client.handshake.auth) {
      this.logger.warn('Invalid socket client or missing handshake data');
      throw new UnauthorizedException('Invalid socket connection');
    }

    const authToken = client.handshake.auth.token;

    if (!authToken) {
      this.logger.warn('No auth token provided for WebSocket connection.');
      throw new UnauthorizedException('Authentication token required.');
    }

    try {
      if (!process.env.CLERK_JWT_SECRET) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      const decodedToken = await verifyToken(authToken, {
        jwtKey: process.env.CLERK_JWT_SECRET,
      });

      // Attach the userId to the client for further use in the gateway
      if (decodedToken.sub) {
        client.handshake.auth.userId = decodedToken.sub;
      }
      const clientId = client.id || 'unknown';
      const userId = decodedToken.sub || 'unknown';
      this.logger.log(
        `WebSocket client ${clientId} authenticated as user ${userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `WebSocket authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException('Invalid authentication token.');
    }
  }
}
