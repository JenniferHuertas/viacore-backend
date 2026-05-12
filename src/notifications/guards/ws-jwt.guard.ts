import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const client =
      context.switchToWs().getClient();

    const token =
      client.handshake.auth?.token;

    if (!token) {
      throw new UnauthorizedException(
        'Token missing',
      );
    }

    try {
      const payload =
        this.jwtService.verify(token);

      client.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }
  }
}