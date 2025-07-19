import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Token } from "./dto/token.dto";
import { TokenRefreshDto } from "./dto/token-refresh.dto";
import { SignupDto } from "./dto/signup.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyDto } from "./dto/verify.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/register")
  async register(@Body() data: SignupDto) {
    return await this.authService.register(data);
  }

  @Post("/verify-email")
  async verifyEmail(@Body() data: VerifyDto) {
    return await this.authService.verifyUserEmail(data);
  }

  @Post("login")
  async login(@Body() data: LoginDto): Promise<Token> {
    return this.authService.login(data);
  }

  @Post("/forgot-password")
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post("/reset-password")
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Post("/refresh-token")
  async refreshToken(@Body() data: TokenRefreshDto): Promise<Token> {
    return this.authService.refreshToken(data.token);
  }
}
