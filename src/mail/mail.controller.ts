import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { SendTestEmailDto } from "./dto/send-test-email.dto";
import { MailService } from "./mail.service";
import { SettingService } from "src/setting/setting.service";
import { PrismaService } from "src/prisma.service";
import { SubmitContactDto } from "./dto/submit-contact-dto";

@ApiTags("Mail")
@Controller("mail")
export class MailController {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly settingService: SettingService,
    private readonly prisma: PrismaService
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
      },
    });

    return { success: true };
  }

  @Post("/contact")
  async submitContact(@Body() data: SubmitContactDto) {
    const settings = await this.settingService.getByNamespace("email");
    const fromEmail = settings["FROM_EMAIL"];
    const fromName = settings["FROM_NAME"];
    const siteName = await this.settingService.getValue("general", "siteName");

    if (!data.email) throw new Error("Customer email is missing");

    await this.mailService.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: data.email,
      subject: "We Received Your Contact Submission",
      template: "contact-submission",
      context: {
        name: data.fullName,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        propertyAddress: data.propertyAddress,
        note: data.note || "N/A",
        website: siteName,
      },
    });

    // const adminEmail = settings["ADMIN_EMAIL"];

    await this.mailService.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: "luongvanduy2410@gmail.com",
      subject: "New Contact Submission",
      template: "contact-submission",
      context: {
        name: "Admin",
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        propertyAddress: data.propertyAddress,
        note: data.note || "N/A",
        website: siteName,
      },
    });

    return { success: true, message: "Contact email sent successfully" };
  }

  @Post("/send-order/:orderId")
  async sendOrderEmail(@Param("orderId") orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { items: { include: { service: true } } },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const settings = await this.settingService.getByNamespace("email");
    const fromEmail = settings["FROM_EMAIL"];
    const fromName = settings["FROM_NAME"];

    const siteName = await this.settingService.getValue("general", "siteName");

    const contextData = {
      website: siteName,
      orderId: order.id,
      customerName: order.name,
      customerEmail: order.email,
      customerPhone: order.phone,
      customerAddress: order.address,
      note: order.note || "N/A",
      items: order.items.map((item) => ({
        serviceName: item.service.title,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    await this.mailService.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: [order.email],
      subject: "Your Order Has Been Created",
      template: "order-created",
      context: { ...contextData, name: order.name, isAdmin: false },
    });

    await this.mailService.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: ["luongvanduy2410@gmail.com"],
      subject: "New Order Notification",
      template: "order-created-admin",
      context: { ...contextData, name: "Admin", isAdmin: true },
    });

    return { success: true };
  }
}
