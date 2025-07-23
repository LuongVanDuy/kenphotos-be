import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CategoryService } from "./category.service";
import { Users } from "src/common/decorators/users.decorator";
import { FindCategoryDto } from "./dto/find-category.dto";
import { getPageable, getSort } from "src/common/functions";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Module, Permission } from "src/common/types";
import { Roles } from "src/common/decorators/roles.decorator";
import { UpdateCategoryDto } from "./dto/update-category";

@ApiTags("Categories")
@Controller("tour/categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "itemsPerPage", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortDesc", required: false })
  async findAll(
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("itemsPerPage") itemsPerPage?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortDesc") sortDesc?: boolean
  ) {
    const params: FindCategoryDto = {
      search: search || "",
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
    };
    const data = await this.categoryService.findAll(params);
    const total = await this.categoryService.count(params);
    return { total, data };
  }

  @Post()
  @Roles({ module: Module.CATEGORY, permission: Permission.CREATE })
  async create(@Users() userRequest, @Body() data: CreateCategoryDto) {
    return await this.categoryService.create(userRequest, data);
  }

  @Get(":id")
  @Roles({ module: Module.CATEGORY, permission: Permission.READ })
  async findOne(@Param("id") id: number) {
    return await this.categoryService.findOne(Number(id));
  }

  @Put(":id")
  @Roles({ module: Module.CATEGORY, permission: Permission.UPDATE })
  async update(@Users() userRequest, @Param("id") id: number, @Body() data: UpdateCategoryDto) {
    return await this.categoryService.update(userRequest, Number(id), data);
  }

  @Delete(":id")
  @Roles({ module: Module.CATEGORY, permission: Permission.DELETE })
  async delete(@Users() userRequest, @Param("id") id: number) {
    return await this.categoryService.delete(userRequest, Number(id));
  }
}
