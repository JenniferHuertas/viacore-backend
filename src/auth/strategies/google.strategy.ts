import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      callbackURL: process.env.GOOGLE_CALLBACK_URL!,

      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log('RETURN TO:', req.query.returnTo);
    try {
      console.log('RETURN TO:', req.query.returnTo);
      const { name, emails } = profile;
      const mode = req.query.state === 'signup' ? 'signup' : 'signin';
      console.log('GOOGLE MODE:', mode);
      const result = await this.authService.findOrCreateGoogleUser(
        {
          email: emails?.[0]?.value || '',

          name: `${name?.givenName || ''} ${name?.familyName || ''}`,

          googleId: profile.id,
        },
        mode,
      );
      done(null, result);
    } catch (error: any) {
      console.log('GOOGLE STRATEGY ERROR:', error);
      done(null, false, {
        message:
          error?.response?.message || error?.message || 'google_auth_failed',
      });
    }
  }
}
