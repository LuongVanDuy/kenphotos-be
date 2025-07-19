import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigService } from "@nestjs/config";
import { MailController } from "./mail.controller";
import { join } from "path";
import { BullModule } from "@nestjs/bull";

@Module({
  imports: [
    BullModule.registerQueue({ name: "mail" }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get("SMTP_SERVER"),
          port: configService.get("SMTP_PORT"),
          secure: false,
          auth: {
            user: configService.get("SMTP_FROM_EMAIL"),
            pass: configService.get("SMTP_APP_PASSWORD"),
          },
        },
        defaults: {
          from: `"${configService.get("SMTP_FROM_NAME")}" <${configService.get("SMTP_FROM_EMAIL")}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
