import { Controller, Get, Post as HttpPost, Put, Query, UseGuards, Post, Param } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { PostService } from "./post.service";
import { FindPostDto } from "./dto/find-post.dto";
import { getPageable, getSort } from "src/common/functions";

@ApiTags("Posts Public")
@Controller("public/posts")
export class PostPublicController {
  constructor(private readonly postService: PostService) {}
  @Get()
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "itemsPerPage", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortDesc", required: false })
  @ApiQuery({ name: "limitWords", required: false })
  async findAll(
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("itemsPerPage") itemsPerPage?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortDesc") sortDesc?: boolean,
    @Query("limitWords") limitWords?: number
  ) {
    const params: FindPostDto = {
      search: search || "",
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
      limitWords: limitWords !== undefined ? Number(limitWords) : undefined,
    };
    const data = await this.postService.findAllPublic(params);
    const total = await this.postService.countPublic(params);
    return { total, data };
  }

  @Get(":slug")
  async findOne(@Param("slug") slug: string) {
    return await this.postService.findBySlug(slug);
  }
}
