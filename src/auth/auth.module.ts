import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { RedisModule } from "src/redis/redis.module";
import { JwtStrategy } from "./guards/jwt.strategy";
import { ApiKeyStrategy } from "./guards/api-key.strategy";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("EXPIRES_IN", "1h"),
          },
        };
      },
      inject: [ConfigService],
    }),
    RedisModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ApiKeyStrategy],
})
export class AuthModule {}
