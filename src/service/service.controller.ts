import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UseGuards, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ServiceService } from "./service.service";
import { getPageable, getSort } from "src/common/functions";
import { Module, Permission } from "src/common/types";
import { Roles } from "src/common/decorators/roles.decorator";
import { Users } from "src/common/decorators/users.decorator";
import { FindServiceDto } from "./dto/find-service.dto";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service";
import { BulkIdsDto } from "./dto/bulk-post.dto";

@ApiTags("Services")
@Controller("services")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @Roles({ module: Module.SERVICE, permission: Permission.READ })
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
    const params: FindServiceDto = {
      search: search || "",
      status,
      deleteFlg,
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
    };
    const data = await this.serviceService.findAll(params);
    const total = await this.serviceService.count(params);
    return { total, data };
  }

  @Post()
  @Roles({ module: Module.SERVICE, permission: Permission.CREATE })
  async create(@Users() userRequest, @Body() data: CreateServiceDto) {
    return await this.serviceService.create(userRequest, data);
  }

  @Get(":id")
  @Roles({ module: Module.SERVICE, permission: Permission.READ })
  async findOne(@Param("id") id: number) {
    return await this.serviceService.findOne(Number(id));
  }

  @Put(":id")
  @Roles({ module: Module.SERVICE, permission: Permission.UPDATE })
  async update(@Users() userRequest, @Param("id") id: number, @Body() data: UpdateServiceDto) {
    return await this.serviceService.update(userRequest, Number(id), data);
  }

  @Patch("delete")
  @Roles({ module: Module.SERVICE, permission: Permission.DELETE })
  async delete(@Users() userRequest, @Body() dto: BulkIdsDto) {
    return await this.serviceService.bulkSoftDelete(userRequest, dto);
  }

  @Patch("restore")
  @Roles({ module: Module.SERVICE, permission: Permission.RESTORE })
  async restore(@Users() userRequest, @Body() dto: BulkIdsDto) {
    return await this.serviceService.bulkRestore(userRequest, dto);
  }

  @Delete("permanent")
  @Roles({ module: Module.SERVICE, permission: Permission.DELETE })
  async hardDelete(@Users() userRequest, @Body() dto: BulkIdsDto) {
    return await this.serviceService.bulkHardDelete(userRequest, dto);
  }
}
