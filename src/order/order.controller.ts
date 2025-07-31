import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UseGuards, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { getPageable, getSort } from "src/common/functions";
import { FindOrderDto } from "./dto/find-order.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { Module, Permission } from "src/common/types";
import { OrderService } from "./order.service";
import { Users } from "src/common/decorators/users.decorator";
import { User } from "@prisma/client";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order";
import { BulkIdsDto } from "./dto/bulk-order.dto";

@ApiTags("Orders")
@Controller("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Roles({ module: Module.ORDER, permission: Permission.READ })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "status", required: false, type: Number })
  @ApiQuery({ name: "deleteFlg", required: false, type: Number })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "itemsPerPage", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortDesc", required: false })
  async findAll(
    @Query("search") search?: string,
    @Query("status") status?: number,
    @Query("deleteFlg") deleteFlg?: number,
    @Query("page") page?: number,
    @Query("itemsPerPage") itemsPerPage?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortDesc") sortDesc?: boolean
  ) {
    const params: FindOrderDto = {
      search: search || "",
      status,
      deleteFlg,
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
    };
    const data = await this.orderService.findAll(params);
    const total = await this.orderService.count(params);
    return { total, data };
  }

  @Post()
  @Roles({ module: Module.ORDER, permission: Permission.CREATE })
  async create(@Users() userRequest: User, @Body() data: CreateOrderDto) {
    return await this.orderService.create(userRequest, data);
  }

  @Get(":id")
  @Roles({ module: Module.ORDER, permission: Permission.READ })
  async findOne(@Param("id") id: number) {
    return await this.orderService.findOne(Number(id));
  }

  @Put(":id")
  @Roles({ module: Module.ORDER, permission: Permission.UPDATE })
  async update(@Param("id") id: number, @Users() userRequest: User, @Body() data: UpdateOrderDto) {
    return await this.orderService.update(Number(id), userRequest, data);
  }

  @Patch("delete")
  @Roles({ module: Module.ORDER, permission: Permission.DELETE })
  async softDelete(@Users() userRequest, @Body() dto: BulkIdsDto) {
    return await this.orderService.bulkSoftDelete(userRequest, dto);
  }

  @Patch("restore")
  @Roles({ module: Module.ORDER, permission: Permission.RESTORE })
  async restore(@Users() userRequest, @Body() dto: BulkIdsDto) {
    return await this.orderService.bulkRestore(userRequest, dto);
  }

  @Delete("permanent")
  @Roles({ module: Module.ORDER, permission: Permission.DELETE })
  async hardDelete(@Users() userRequest, @Body() dto: BulkIdsDto) {
    return await this.orderService.bulkHardDelete(userRequest, dto);
  }
}
