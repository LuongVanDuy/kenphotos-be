import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UseGuards, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { PostService } from "./post.service";
import { FindPostDto } from "./dto/find-post.dto";
import { getPageable, getSort } from "src/common/functions";
import { Module, Permission } from "src/common/types";
import { Roles } from "src/common/decorators/roles.decorator";
import { Users } from "src/common/decorators/users.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post";

@ApiTags("Posts")
@Controller("posts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Get()
  @Roles({ module: Module.POST, permission: Permission.READ })
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
    const params: FindPostDto = {
      search: search || "",
      status,
      deleteFlg,
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
    };
    const data = await this.postService.findAll(params);
    const total = await this.postService.count(params);
    return { total, data };
  }

  @Post()
  @Roles({ module: Module.POST, permission: Permission.CREATE })
  async create(@Users() userRequest, @Body() data: CreatePostDto) {
    return await this.postService.create(userRequest, data);
  }

  @Get(":id")
  @Roles({ module: Module.POST, permission: Permission.READ })
  async findOne(@Param("id") id: number) {
    return await this.postService.findOne(Number(id));
  }

  @Put(":id")
  @Roles({ module: Module.POST, permission: Permission.UPDATE })
  async update(@Users() userRequest, @Param("id") id: number, @Body() data: UpdatePostDto) {
    return await this.postService.update(userRequest, Number(id), data);
  }

  @Delete(":id")
  @Roles({ module: Module.POST, permission: Permission.DELETE })
  async delete(@Users() userRequest, @Param("id") id: number) {
    return await this.postService.delete(userRequest, Number(id));
  }
}
