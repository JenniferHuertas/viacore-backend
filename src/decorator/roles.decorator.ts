import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/auth/roles.enum';

export const Roles = (...role: Role[]) => SetMetadata('roles', role);
