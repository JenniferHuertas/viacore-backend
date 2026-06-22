import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { randomUUID } from 'crypto';

@Injectable()
export class GuestSessionMiddleware
  implements NestMiddleware
{
  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    let guestSession =
      req.cookies?.guest_session;

    if (!guestSession) {
      guestSession = randomUUID();

      res.cookie(
        'guest_session',
        guestSession,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            'production',
          sameSite:
            process.env.NODE_ENV ===
            'production'
              ? 'none'
              : 'lax',
          maxAge:
            1000 * 60 * 60 * 24 * 7,
        },
      );
    }

    req['guestSession'] =
      guestSession;

    next();
  }
}