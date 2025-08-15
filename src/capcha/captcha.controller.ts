// captcha.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from "@nestjs/common";
import { CaptchaService } from "./captcha.service";

@Controller("captcha")
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post("verify")
  async verify(@Body("token") token: string) {
    const isValid = await this.captchaService.verifyToken(token);
    if (!isValid) {
      throw new HttpException("Captcha verification failed", HttpStatus.BAD_REQUEST);
    }
    return { verified: true };
  }
}
