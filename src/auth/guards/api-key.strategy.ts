import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, "api-key") {
  constructor(private readonly configService: ConfigService) {
    super({ header: "X-API-KEY", prefix: "" }, true);
  }

  validate(apiKey: string): any {
    const validKey = this.configService.get<string>("API_KEY");
    if (apiKey === validKey) {
      return true; // authenticated successfully
    }
    throw new UnauthorizedException("Invalid API Key");
  }
}
