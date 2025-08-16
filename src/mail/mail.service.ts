import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { PrismaService } from "src/prisma.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { SettingService } from "src/setting/setting.service";

@Injectable()
export class MailService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly settingService: SettingService, 
    @InjectQueue("mail") private mailQueue: Queue
  ) {}

  async sendMail(sendMailOptions: ISendMailOptions) {
    try {
      const settings = await this.settingService.getByNamespace("email");
      const fromEmail = settings["FROM_EMAIL"];
      const fromName = settings["FROM_NAME"];

      sendMailOptions.from = `"${fromName}" <${fromEmail}>`;

      await this.mailerService.sendMail(sendMailOptions);
    } catch (error) {
      console.error("[SendMail Error]", error);

      throw new InternalServerErrorException(
        "Gửi email thất bại. Vui lòng kiểm tra lại cấu hình SMTP."
      );
    }
  }
}