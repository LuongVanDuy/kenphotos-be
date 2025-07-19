import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SendTestEmailDto } from "./dto/send-test-email.dto";
import { MailService } from "./mail.service";

@ApiTags("Mail")
@Controller("mail")
export class MailController {
  constructor(private readonly configService: ConfigService, private readonly mailService: MailService) {}

  @Post("/test")
  async test(@Body() data: SendTestEmailDto) {
    const fromEmail = this.configService.get("SMTP_FROM_EMAIL");

    await this.mailService.sendMail({
      from: fromEmail,
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
