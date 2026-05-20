

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { Observable } from 'rxjs';

import { Role } from '../roles.enum';

@Injectable()
export class AuthGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ):
    | boolean
    | Promise<boolean>
    | Observable<boolean> {

    const request =
      context
        .switchToHttp()
        .getRequest();

    const token =
      request.cookies?.userSession;

    if (!token) {
      throw new UnauthorizedException(
        'Token not provided',
      );
    }

    const secret =
      process.env.JWT_SECRET;

    try {
      const payload =
        this.jwtService.verify(
          token,
          { secret },
        );

      payload.roles =
        payload.role
          ? [payload.role]
          : [Role.User];

      request.user = payload;

      return true;

    } catch {
      throw new UnauthorizedException(
        'Invalid or expired token',
      );
    }
  }
}