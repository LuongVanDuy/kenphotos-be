import { Body, Controller, Delete, Get, Param, Post, Put, Patch, Query, UseGuards, UseInterceptors, UploadedFiles, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { getPageable, getSort } from "src/common/functions";
import { MediaService } from "./media.service";
import { Module, Permission } from "src/common/types";
import { FindMediaDto } from "./dto/find-media.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import dayjs from "dayjs";
import { basename, extname, join } from "path";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";

@ApiTags("Media")
@Controller("media")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Roles({ module: Module.MEDIA, permission: Permission.READ })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "itemsPerPage", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortDesc", required: false })
  async findAll(
    @Query("search") search?: string,
    @Query("status") status?: number,
    @Query("page") page?: number,
    @Query("itemsPerPage") itemsPerPage?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortDesc") sortDesc?: boolean
  ) {
    const params: FindMediaDto = {
      search: search || "",
      status: status,
      pageable: getPageable(Number(page), Number(itemsPerPage)),
      sort: getSort(sortBy, sortDesc),
    };
    const data = await this.mediaService.findAll(params);
    const total = await this.mediaService.count(params);
    return { total, data };
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @Roles({ module: Module.MEDIA, permission: Permission.CREATE })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const now = dayjs();
          const uploadPath = join(process.cwd(), "uploads", now.format("YYYY"), now.format("MM"));
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const now = dayjs();
          const uploadPath = join(process.cwd(), "uploads", now.format("YYYY"), now.format("MM"));

          let baseName = basename(file.originalname, extname(file.originalname));
          let ext = extname(file.originalname);
          let finalName = `${baseName}${ext}`;
          let counter = 1;

          while (fs.existsSync(join(uploadPath, finalName))) {
            finalName = `${baseName}-${counter}${ext}`;
            counter++;
          }

          cb(null, finalName);
        },
      }),
    })
  )
  async upload(@UploadedFiles() files: Express.Multer.File[], @Req() req) {
    const now = dayjs();
    const result = await Promise.all(files.map((file) => this.mediaService.createFromFile(file, req.user, now)));
    return result.length === 1 ? result[0] : result;
  }

  @Delete()
  @Roles({ module: Module.MEDIA, permission: Permission.DELETE })
  async deleteMany(@Body() ids: number[]) {
    return this.mediaService.deleteMany(ids);
  }
}
