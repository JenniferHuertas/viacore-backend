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

@UseInterceptors(
  ClassSerializerInterceptor,
)

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
    @Req() req,

    @Res() res: Response,
  ) {
    try {

      const token =
        req.user.access_token;

      res.cookie(
        'userSession',
        token,
        {
          httpOnly: true,

          secure: false,

          sameSite: 'lax',

          maxAge:
            1000 * 60 * 60,

          path: '/',
        },
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}`,
      );

    } catch {

      return res.redirect(
        `${process.env.FRONTEND_URL}/autenticacion?error=google`,
      );
    }
  }

  @Post('signup')
  @UseInterceptors(
    ClassSerializerInterceptor,
  )
  @SerializeOptions({
    groups: ['newUser'],
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
      'userSession',
      response.access_token,
      {
        httpOnly: true,

        secure: false,

        sameSite: 'lax',

        maxAge:
          1000 * 60 * 60,

        path: '/',
      },
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
      'userSession',
      {
        httpOnly: true,

        secure: false,

        sameSite: 'lax',

        path: '/',
      },
    );

    return {
      logout: true,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(
    @Req() req: Request,
  ) {

    return (req as any).user;
  }
}