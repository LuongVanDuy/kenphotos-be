import { Body, Controller, Delete, Get, Param, Post, Put, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { getPageable, getSort } from "src/common/functions";
import { UserService } from "./user.service";
import { Module, Permission } from "src/common/types";
import { FindUserDto } from "./dto/find-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Users } from "src/common/decorators/users.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@ApiTags("Users")
@Controller("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles({ module: Module.USER, permission: Permission.READ })
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
    const params: FindUserDto = {
      search: search || "",
      status,
      deleteFlg,
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
    };
    const data = await this.userService.findAll(params);
    const total = await this.userService.count(params);
    return { total, data };
  }

  @Post()
  @Roles({ module: Module.USER, permission: Permission.CREATE })
  async create(@Users() userRequest, @Body() data: CreateUserDto) {
    return await this.userService.create(userRequest, data);
  }

  @Get(":id")
  @Roles({ module: Module.USER, permission: Permission.READ })
  async findOne(@Param("id") id: number) {
    return await this.userService.findOne(Number(id));
  }

  @Put(":id")
  @Roles({ module: Module.USER, permission: Permission.UPDATE })
  async update(@Users() userRequest, @Param("id") id: number, @Body() data: UpdateUserDto) {
    return await this.userService.update(userRequest, Number(id), data);
  }

  @Delete(":id")
  @Roles({ module: Module.USER, permission: Permission.DELETE })
  async delete(@Users() userRequest, @Param("id") id: number) {
    return await this.userService.delete(userRequest, Number(id));
  }

  @Put(":id/change-password")
  @Roles({ module: Module.USER, permission: Permission.UPDATE })
  async changePassword(@Users() userRequest, @Param("id") id: number, @Body() data: ChangePasswordDto) {
    return await this.userService.changePassword(userRequest, Number(id), data);
  }
}
