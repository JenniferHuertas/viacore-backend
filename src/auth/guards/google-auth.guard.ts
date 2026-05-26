import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const isSignup = req.path.includes('/signup');
    return {
      session: false,
      state: isSignup ? 'signup' : 'signin',
    };
  }

  handleRequest(err: any, user: any) {
    if (err) {
      throw err;
    }
    return user;
  }
}
