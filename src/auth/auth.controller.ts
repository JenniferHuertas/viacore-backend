import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  ClassSerializerInterceptor,
  UseInterceptors,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import { GoogleAuthGuard } from './guards/google-auth.guard';

import { AuthGuard } from './guards/auth.guard';

import { AuthService } from './auth.service';

import { CreateUserDto, LoginUserDto } from 'src/users/dto/create-user.dto';

import { ApiTags } from '@nestjs/swagger';

const cookieConfig = {
  httpOnly: true,

  secure: false,

  sameSite: 'lax' as const,

  maxAge: 1000 * 60 * 60,

  path: '/',
};

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(
    @Req()
    req: any,

    @Res()
    res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    console.log('GOOGLE CALLBACK USER:', req.user);

    if (!req.user) {
      return res.redirect(
        `${frontendUrl}/autenticacion/autenticacion-google?error=google_auth_failed`,
      );
    }

    const token = req.user.access_token;

    console.log('GOOGLE TOKEN:', token);

    if (!token) {
      return res.redirect(
        `${frontendUrl}/autenticacion/autenticacion-google?error=google_token_missing`,
      );
    }

    res.cookie('userSession', token, cookieConfig);

    console.log('COOKIE SET SUCCESS');

    return res.redirect(`${frontendUrl}/autenticacion/autenticacion-google`);
  }

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    groups: ['newUser'],
  })
  register(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.authService.create(createUserDto);
  }

  @Post('signin')
  async signin(
    @Body()
    credentials: LoginUserDto,

    @Res({ passthrough: true })
    res: Response,
  ) {
    const response = await this.authService.signIn(credentials);

    console.log('SIGNIN RESPONSE:', response);

    res.cookie('userSession', response.access_token, cookieConfig);

    console.log('SIGNIN COOKIE SET:', response.access_token);

    return {
      login: true,
      role: response.role,
      id: response.id,
    };
  }

  @Post('logout')
  logout(
    @Res({ passthrough: true })
    res: Response,
  ) {
    console.log('CLEAR COOKIE');

    res.clearCookie('userSession', cookieConfig);

    return {
      logout: true,
    };
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; password: string }) {
    return this.authService.resetPassword(body.email, body.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(
    @Req()
    req: Request,
  ) {
    console.log('PROFILE USER:', (req as any).user);

    return (req as any).user;
  }
}
