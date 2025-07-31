import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { OrderPublicController } from "./order-public.controller";

@Module({
  controllers: [OrderController, OrderPublicController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
