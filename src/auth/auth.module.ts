import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';

import { AuthGuard } from './guards/auth.guard';

import { GoogleAuthGuard } from './guards/google-auth.guard';

import { GoogleStrategy } from './strategies/google.strategy';

import { Users } from 'src/users/entities/user.entity';

import { EmailModule } from 'src/notifications/channels/email/email.module';

import { PasswordResetToken } from './entities/password-reset-token.entity';

import { ForgotPasswordService } from './forgot-password/forgot-password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      PasswordResetToken,
    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,

      signOptions: {
        expiresIn: '7d',
      },
    }),

    EmailModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    ForgotPasswordService,
    AuthGuard,
    GoogleAuthGuard,
    GoogleStrategy,
  ],

  exports: [
    AuthGuard,
    JwtModule,
    TypeOrmModule,
  ],
})
export class AuthModule {}
