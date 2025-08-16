import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {  ApiTags } from "@nestjs/swagger";
import { SendTestEmailDto } from "./dto/send-test-email.dto";
import { MailService } from "./mail.service";
import { SettingService } from "src/setting/setting.service";

@ApiTags("Mail")
@Controller("mail")
export class MailController {
  constructor(
    private readonly configService: ConfigService, 
    private readonly mailService: MailService,   
    private readonly settingService: SettingService 
  ) {}

  @Post("/test")
  async test(@Body() data: SendTestEmailDto) {
    const settings = await this.settingService.getByNamespace("email");
    const fromEmail = settings["FROM_EMAIL"];
    const fromName = settings["FROM_NAME"];

    await this.mailService.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: data.to,
      subject: "Test email",
      template: "test",
      context: {
        id: 1,
        email: data.to,
        domain: process.env.DOMAIN,
        logoUrl: "https://funface.vn/wp-content/uploads/2024/11/Logo.png",
      },
    });

    return { success: true };
  }
}
