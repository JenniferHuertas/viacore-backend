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

import type {
  Request,
  Response,
} from 'express';

import { GoogleAuthGuard } from './guards/google-auth.guard';

import { AuthGuard } from './guards/auth.guard';

import { AuthService } from './auth.service';

import {
  CreateUserDto,
  LoginUserDto,
} from 'src/users/dto/create-user.dto';

import { ApiTags } from '@nestjs/swagger';

const cookieConfig = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV ===
    'production',

  sameSite:
    process.env.NODE_ENV ===
    'production'
      ? 'none'
      : 'lax',

  maxAge: 1000 * 60 * 60,

  path: '/',
} as const;

@UseInterceptors(ClassSerializerInterceptor)

@ApiTags('Auth')

@Controller('auth')

export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

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

    const frontendUrl =
      process.env.FRONTEND_URL ||
      `http://localhost:3000`;

    try {

      const token =
        req.user.access_token;

      res.cookie(
        `userSession`,
        token,
        cookieConfig,
      );

      return res.redirect(
        `${frontendUrl}/autenticacion/autenticacion-google`,
      );

    } catch {

      return res.redirect(
        `${frontendUrl}/autenticacion?error=google`,
      );

    }
  }

  @Post('signup')

  @UseInterceptors(ClassSerializerInterceptor)

  @SerializeOptions({
    groups: [`newUser`],
  })

  register(
    @Body()
    createUserDto: CreateUserDto,
  ) {

    return this.authService.create(
      createUserDto,
    );

  }

  @Post('signin')

  async signin(
    @Body()
    credentials: LoginUserDto,

    @Res({ passthrough: true })
    res: Response,
  ) {

    const response =
      await this.authService.signIn(
        credentials,
      );

    res.cookie(
      `userSession`,
      response.access_token,
      cookieConfig,
    );

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

    res.clearCookie(
      `userSession`,
      cookieConfig,
    );

    return {
      logout: true,
    };
  }

  @Post('forgot-password')
forgotPassword(
  @Body() body: { email: string },
) {
  return this.authService.forgotPassword(
    body.email,
  );
}

@Post("reset-password")
async resetPassword(
  @Body() body: { token: string; password: string }
) {
  return this.authService.resetPassword(
    body.token,
    body.password,
  );
}

  @Get('profile')

  @UseGuards(AuthGuard)

  getProfile(
    @Req()
    req: Request,
  ) {

    return (req as any).user;

  }
}