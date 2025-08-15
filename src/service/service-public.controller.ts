import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, Post } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { ServiceService } from "./service.service";
import { getPageable, getSort } from "src/common/functions";
import { Module, Permission } from "src/common/types";
import { Roles } from "src/common/decorators/roles.decorator";
import { FindServiceDto } from "./dto/find-service.dto";

@ApiTags("Services Public")
@Controller("public/services")
export class ServicePublicController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "itemsPerPage", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortDesc", required: false })
  async findAllPublic(
    @Query("search") search?: string,
    @Query("category") category?: number,
    @Query("page") page?: number,
    @Query("itemsPerPage") itemsPerPage?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortDesc") sortDesc?: boolean
  ) {
    const params: FindServiceDto = {
      search: search || "",
      category: category ? Number(category) : undefined,
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
    };
    const data = await this.serviceService.findAllPublic(params);
    const total = await this.serviceService.countPublic(params);
    return { total, data };
  }

  @Get("/:slug")
  async findOneBySlug(@Param("slug") slug: string) {
    return await this.serviceService.findOneBySlug(slug);
  }
}
