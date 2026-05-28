import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.userSession;

    console.log('COOKIE TOKEN:', token);

    if (!token) {
      throw new UnauthorizedException(
        'Token not provided',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Verificar que el usuario sigue activo en DB
      const user = await this.usersRepository.findOne({
        where: { id: payload.id },
        select: ['id', 'isActive', 'role'],
      });

      if (!user) {
        throw new UnauthorizedException(
          'Usuario no encontrado',
        );
      }

      if (!user.isActive) {
        throw new UnauthorizedException(
          'Tu cuenta ha sido bloqueada. Contacta al administrador.',
        );
      }

      request.user = payload;
      return true;
    } catch (error) {
      // Re-lanzar UnauthorizedException sin envolver
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
