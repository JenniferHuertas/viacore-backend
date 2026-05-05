import { Role } from '../roles.enum';

export interface IJwtPayload {
  id: string;
  email: string;
  role: Role;
  iat: string;
  exp: string;
}
