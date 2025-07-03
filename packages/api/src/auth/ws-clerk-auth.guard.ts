import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { IncomingMessage } from 'http';
import { Socket } from 'socket.io';

@Injectable()
export class WsClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
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
      client.handshake.auth.userId = decodedToken.sub;
      this.logger.log(
        `WebSocket client ${client.id} authenticated as user ${decodedToken.sub}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid authentication token.');
    }
  }
}
