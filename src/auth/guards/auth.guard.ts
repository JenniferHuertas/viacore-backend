import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard
  implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request =
      context
        .switchToHttp()
        .getRequest();

    const token =
      request.cookies?.userSession ||
      request.headers?.authorization?.replace('Bearer ', '');

    console.log(
      'COOKIE TOKEN:',
      token,
    );

    if (!token) {
      throw new UnauthorizedException(
        'Token not provided',
      );
    }

    try {

      const payload =
        await this.jwtService.verifyAsync(
          token,
        );

      request.user = payload;

      return true;

    } catch {

      throw new UnauthorizedException(
        'Invalid token',
      );
    }
  }
}
