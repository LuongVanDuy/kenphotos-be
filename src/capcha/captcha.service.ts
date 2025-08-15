// captcha.service.ts
import { Injectable } from "@nestjs/common";
import fetch from "node-fetch";

@Injectable()
export class CaptchaService {
  private readonly secretKey = process.env.RECAPTCHA_SECRET_KEY;

  async verifyToken(token: string): Promise<boolean> {
    if (!token) return false;

    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${this.secretKey}&response=${token}`;

    try {
      const response = await fetch(verifyURL, { method: "POST" });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Captcha verification error:", error);
      return false;
    }
  }
}
