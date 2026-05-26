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
import { CreateUserDto, LoginUserDto } from 'src/users/dto/create-user.dto';
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

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly forgotPasswordService: ForgotPasswordService,
  ) {}

  // =========================
  // GOOGLE LOGIN START
  // =========================

  @Get('google/signin')
  @UseGuards(GoogleAuthGuard)
  googleSignin() {}

  @Get('google/signup')
  @UseGuards(GoogleAuthGuard)
  googleSignup() {}

  // =========================
  // GOOGLE CALLBACK (FIXED)
  // =========================

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const googleError = req.googleAuthError;
      const user = req.user;

      // =========================
      // ERROR HANDLING
      // =========================
      if (googleError) {
        console.log('GOOGLE CALLBACK ERROR:', googleError);

        if (googleError.includes('No existe una cuenta registrada')) {
          return res.redirect(
            `${frontendUrl}/autenticacion?tab=signup&error=no_account_google`,
          );
        }

        if (googleError.includes('ya existe')) {
          return res.redirect(
            `${frontendUrl}/autenticacion?tab=signin&error=account_exists`,
          );
        }

        return res.redirect(
          `${frontendUrl}/autenticacion?error=google_auth_failed`,
        );
      }

      // =========================
      // LOGIN OK
      // =========================
      const token = user.access_token;

      res.cookie('userSession', token, cookieConfig);

      // =========================
      // FIX: RETURN PATH SAFE FLOW
      // =========================
      let returnTo = '/';

      try {
        const state = req.query.state;

        if (state) {
          const parsed = JSON.parse(decodeURIComponent(state));
          returnTo = parsed?.returnTo || '/';
        }
      } catch (e) {
        console.log('STATE PARSE ERROR:', e);
      }

      console.log('RETURN TO FINAL:', returnTo);

      // =========================
      // REDIRECT FRONTEND
      // =========================
      return res.redirect(
        `${frontendUrl}/autenticacion/autenticacion-google?returnTo=${encodeURIComponent(
          returnTo,
        )}`,
      );
    } catch (error: any) {
      console.log(
        'GOOGLE CALLBACK ERROR:',
        error?.response?.message || error?.message,
      );

      return res.redirect(
        `${frontendUrl}/autenticacion?error=google_auth_failed`,
      );
    }
  }

  // =========================
  // EMAIL AUTH
  // =========================

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
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
  // PASSWORD RECOVERY
  // =========================

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.forgotPasswordService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.forgotPasswordService.resetPassword(
      dto.token,
      dto.password,
    );
  }

  // =========================
  // LOGOUT
  // =========================

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    console.log('CLEAR COOKIE');
    res.clearCookie('userSession', cookieConfig);

    return { logout: true };
  }

  // =========================
  // PROFILE
  // =========================

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: Request) {
    console.log('PROFILE USER:', (req as any).user);
    return (req as any).user;
  }
}
