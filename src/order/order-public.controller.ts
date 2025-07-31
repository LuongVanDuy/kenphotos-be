import { Controller, Get, Post as HttpPost, Put, Query, UseGuards, Post, Param, Body } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { Users } from "src/common/decorators/users.decorator";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderService } from "./order.service";

@ApiTags("Orders Public")
@Controller("public/orders")
export class OrderPublicController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Users() userRequest: User, @Body() data: CreateOrderDto) {
    return await this.orderService.create(userRequest, data);
  }
}
