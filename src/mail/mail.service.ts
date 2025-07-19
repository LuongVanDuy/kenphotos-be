import { Injectable } from "@nestjs/common";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { PrismaService } from "src/prisma.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    @InjectQueue("mail") private mailQueue: Queue
  ) {}

  async sendMail(sendMailOptions: ISendMailOptions) {
    sendMailOptions.from = this.configService.get("SMTP_FROM_EMAIL");
    await this.mailerService.sendMail(sendMailOptions);
  }
}
