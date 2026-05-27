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
import { ForgotPasswordService } from './forgot-password/forgot-password.service';
import {
  CreateUserDto,
  LoginUserDto,
} from 'src/users/dto/create-user.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './forgot-password/forgot-password.dto';
import { ApiTags } from '@nestjs/swagger';

const isProduction = process.env.NODE_ENV === 'production';

const cookieConfig = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 1000 * 60 * 60,
  path: '/',
};

if (!isProduction) {
  cookieConfig.sameSite = "lax";
  cookieConfig.secure = false;
}

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly forgotPasswordService: ForgotPasswordService,
  ) { }

  // =========================
  // GOOGLE START
  // =========================

  @Get('google/signin')
  @UseGuards(GoogleAuthGuard)
  googleSignin() { }

  @Get('google/signup')
  @UseGuards(GoogleAuthGuard)
  googleSignup() { }

  // =========================
  // GOOGLE CALLBACK (CLEAN)
  // =========================

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const googleError = req.googleAuthError;
      const user = req.user;

      if (googleError) {
        console.log('GOOGLE ERROR:', googleError);
        return res.redirect(
          `${frontendUrl}/autenticacion?error=google_auth_failed`,
        );
      }

      const token = user.access_token;

      // set cookie session
      res.cookie('userSession', token, cookieConfig);

      // 🔥 SIEMPRE mismo destino (SIN state, SIN returnTo)
      return res.redirect(
        `${frontendUrl}/autenticacion/autenticacion-google`,
      );
    } catch (error: any) {
      console.log('GOOGLE CALLBACK ERROR:', error?.message);
      return res.redirect(
        `${frontendUrl}/autenticacion?error=google_auth_failed`,
      );
    }
  }

  // =========================
  // EMAIL AUTH
  // =========================

  @Post('signup')
  @SerializeOptions({ groups: ['newUser'] })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('signin')
  async signin(
    @Body() credentials: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.signIn(credentials);

    res.cookie('userSession', response.access_token, cookieConfig);

    return {
      login: true,
      role: response.role,
      id: response.id,
    };
  }

  // =========================
  // PASSWORD
  // =========================

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.forgotPasswordService.resetPassword(
      dto.token,
      dto.password,
    );
  }

  // =========================
  // LOGOUT
  // =========================

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('userSession', cookieConfig);
    return { logout: true };
  }

  // =========================
  // PROFILE
  // =========================

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: Request) {
    return (req as any).user;
  }
}