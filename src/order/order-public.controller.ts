import { Controller, Post as HttpPost, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderService } from "./order.service";

@ApiTags("Orders Public")
@Controller("public/orders")
export class OrderPublicController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() data: CreateOrderDto) {
    return await this.orderService.createPublic(data);
  }
}
