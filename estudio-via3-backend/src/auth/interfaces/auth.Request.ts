import { Request } from 'express';
import { IJwtPayload } from './jwt_payload.interface';

export interface IAuthRequest extends Request {
  user: IJwtPayload;
  tokenExpiresAt: string;
  route: {
    path: string;
  };
}
