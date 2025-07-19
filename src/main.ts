import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as bodyParser from "body-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/exceptions/http-exception.filter";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.use(bodyParser.json({ limit: "10mb" }));

  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads/",
  });

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT") || 8080;

  app.setGlobalPrefix(configService.get<string>("API_PREFIX"));

  if (process.env.NODE_ENV == "dev") {
    const config = new DocumentBuilder()
      .setTitle("API Document")
      .setDescription("")
      .setVersion("")
      .addBearerAuth()
      .addApiKey(
        {
          type: "apiKey",
          name: "X-API-KEY",
          in: "header",
        },
        "ApiKey"
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("document", app, document);
  }

  await app.listen(port, "0.0.0.0");
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
