import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { MediaModule } from "./media/media.module";
import { PostModule } from "./post/post.module";
import { MailModule } from "./mail/mail.module";
import { CategoryModule } from "./category/category.module";
import { ServiceModule } from "./service/service.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MailModule,
    UserModule,
    PostModule,
    CategoryModule,
    ServiceModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
