import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard
  extends AuthGuard('google') {

  getAuthenticateOptions(
    context: ExecutionContext,
  ) {

    const req =
      context
        .switchToHttp()
        .getRequest();

    const mode =
      req.query.mode === 'signup'
        ? 'signup'
        : 'signin';

    return {
      session: false,
      state: mode,
    };
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
  ) {

    // LOGIN OK

    if (user) {

      return user;
    }

    // IMPORTANTE:
    // NO HACER REDIRECT ACÁ
    // EL CONTROLLER MANEJA LOS REDIRECTS

    console.log(
      'GOOGLE AUTH ERROR:',
      err?.response?.message ||
      err?.message ||
      info?.message,
    );

    return null;
  }
}