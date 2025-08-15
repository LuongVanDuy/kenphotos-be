import { Module } from "@nestjs/common";
import { ServiceController } from "./service.controller";
import { ServiceService } from "./service.service";
import { ServicePublicController } from "./service-public.controller";

@Module({
  controllers: [ServiceController, ServicePublicController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
