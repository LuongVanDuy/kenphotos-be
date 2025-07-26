import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigService } from "@nestjs/config";
import { MailController } from "./mail.controller";
import { join } from "path";
import { BullModule } from "@nestjs/bull";
import { SettingModule } from "src/setting/setting.module";
import { SettingService } from "src/setting/setting.service";

@Module({
  imports: [
    BullModule.registerQueue({ name: "mail" }),
    MailerModule.forRootAsync({
      imports: [SettingModule],
      inject: [SettingService],
      useFactory: async (settingService: SettingService) => {
        const settings = await settingService.getByNamespace("email");

        return {
          transport: {
            host: settings["SMTP_HOST"],
            port: parseInt(settings["SMTP_PORT"], 10),
            secure: settings["SMTP_SECURITY"] === "SSL",
            auth: {
              user: settings["SMTP_USERNAME"],
              pass: settings["SMTP_PASSWORD"],
            },
          },
          defaults: {
            from: `"${settings["FROM_NAME"]}" <${settings["FROM_EMAIL"]}>`,
          },
          template: {
            dir: join(__dirname, "templates"),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
