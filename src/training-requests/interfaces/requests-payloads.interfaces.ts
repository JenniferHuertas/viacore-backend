import { Request } from 'express';
import { Role } from '../../users/enums/roles.enum'; 

export interface UserPayloads {
  id: string;    
  email: string;
  role: Role;      
  roles?: Role[]; 
  iat?: number;    
  exp?: number;
}

export interface RequestWithUsers extends Request {
  user: UserPayloads;
}