import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { compareSync, hashSync } from "bcrypt";
import { LoginDto } from "./dto/login.dto";
import { JwtDto } from "./dto/jwt.dto";
import { Token } from "./dto/token.dto";
import { exclude } from "../common/functions";
import { SignupDto } from "./dto/signup.dto";
import { SuccessType } from "src/common/types";
import { MailService } from "src/mail/mail.service";
import { VerifyDto } from "./dto/verify.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SettingService } from "src/setting/setting.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private mailService: MailService,
    private readonly settingService: SettingService
  ) {}

  async validateUser(payload: JwtDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(payload.id),
      },
    });

    if (user) {
      return {
        ...exclude(user, "password"),
      };
    }

    return null;
  }

  async register(data: SignupDto) {
    const exist = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exist) {
      throw new BadRequestException("Email đã tồn tại");
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashSync(data.password, 10),
        firstName: data.firstName,
        lastName: data.lastName,
        businessName: `${data.firstName} ${data.lastName}`,
        status: 0,
      },
    });

    const token = this.jwtService.sign({ id: user.id, email: user.email }, { expiresIn: "1h" });

    await this.prisma.emailVerify.deleteMany({
      where: { email: user.email },
    });

    await this.prisma.emailVerify.create({
      data: {
        email: user.email,
        verifyToken: token,
      },
    });

    const [siteName, siteUrl] = await Promise.all([
      this.settingService.getValue("general", "siteName"),
      this.settingService.getValue("general", "siteUrl"),
    ]);

    const verifyUrl = `${siteUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

    await this.mailService.sendMail({
      to: user.email,
      subject: "Xác minh địa chỉ email",
      template: "signup",
      context: {
        verifyUrl,
        website: siteName,
      },
    });

    return { id: user?.id, success: true, type: SuccessType.CREATE };
  }

  async verifyUserEmail(data: VerifyDto) {
    const { verifyToken } = data;

    const emailVerify = await this.prisma.emailVerify.findFirst({
      where: { verifyToken },
    });

    if (!emailVerify) {
      throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
    }

    let payload: { id: number; email: string };

    try {
      payload = this.jwtService.verify(verifyToken);
    } catch (err) {
      throw new BadRequestException("Token đã hết hạn.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: 1,
      },
    });

    await this.prisma.emailVerify.delete({
      where: { email: user.email },
    });

    return { success: true, message: "Tài khoản đã được xác minh." };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user || user.deleteFlg === 1) {
      throw new NotFoundException("Tài khoản không tồn tại hoặc đã bị xóa.");
    }

    if (user.status === 0) {
      throw new NotFoundException("Tài khoản chưa xác thực");
    }

    if (!compareSync(data.password, user.password)) {
      throw new BadRequestException("Mật khẩu không chính xác.");
    }

    const payload: JwtDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      role: user.role,
      status: user.status,
    };

    const token = this.signToken(payload);
    return { ...payload, ...token };
  }

  signToken(payload: JwtDto): Token {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("EXPIRES_REFRESH_IN", "7d"),
    });
    const expiredAt = this.jwtService.decode(accessToken)["exp"] as number;
    return {
      accessToken,
      refreshToken,
      expiredAt,
    };
  }

  refreshToken(refreshToken: string): Token {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
      const { iat, exp, ...rest } = payload;
      const token = this.signToken(rest);
      return { ...rest, ...token };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException("Email không tồn tại trong hệ thống.");
    }

    if (user.status === 0) {
      throw new BadRequestException("Tài khoản chưa được kích hoạt.");
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email }, { expiresIn: "1h" });

    await this.prisma.emailVerify.upsert({
      where: { email: user.email },
      update: { verifyToken: token },
      create: { email: user.email, verifyToken: token },
    });

    const [siteName, siteUrl] = await Promise.all([
      this.settingService.getValue("general", "siteName"),
      this.settingService.getValue("general", "siteUrl"),
    ]);

    const resetLink = `${siteUrl}/auth/reset-password?token=${token}`;

    await this.mailService.sendMail({
      to: [user.email],
      subject: "Yêu cầu đặt lại mật khẩu",
      template: "forgot-password",
      context: {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        resetLink,
        website: siteName,
      },
    });

    return { success: true };
  }

  async resetPassword(data: ResetPasswordDto) {
    const { token, newPassword } = data;

    // Tìm token trong bảng email_verify
    const emailVerify = await this.prisma.emailVerify.findFirst({
      where: { verifyToken: token },
    });

    if (!emailVerify) {
      throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
    }

    try {
      // Xác minh JWT token
      const payload = this.jwtService.verify(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new NotFoundException("Người dùng không tồn tại.");
      }

      const hashedPassword = hashSync(newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await this.prisma.emailVerify.update({
        where: { email: emailVerify.email },
        data: { verifyToken: null },
      });

      return { success: true, message: "Đặt lại mật khẩu thành công." };
    } catch (error) {
      throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
    }
  }
}
