import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { ForgotPasswordDto } from "./forgot-password.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

    @Post("reset-password")
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }
}

