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

import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/users/dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport redirige automáticamente a Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req, @Res() res) {

    try {
    const token = req.user.access_token;
    const login= req.user.login;
        
    return res.redirect(
      `http://localhost:3000/autenticacion/autenticacion-google?token=${token}&login=${login}`,
    );
  } catch {
    return res.redirect(
      'http://localhost:3000/login?error=google',
    );
  }
  }

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: ['newUser'] })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('signin')
  signin(@Body() credentials: LoginUserDto) {
    return this.authService.signIn(credentials);
  }
}
