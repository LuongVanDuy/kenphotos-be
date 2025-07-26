import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ConfigService } from "@nestjs/config";
import { likeField } from "../common/functions";
import { FindMediaDto } from "./dto/find-media.dto";
import dayjs from "dayjs";
import { SuccessType } from "src/common/types";
import { basename, extname, join } from "path";
import * as fs from "fs";

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService, private configService: ConfigService) {}

  async findAll(params: FindMediaDto) {
    const { search, status, pageable, sort } = params;

    return this.prisma.media.findMany({
      where: {
        name: likeField(search),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdTime: true,
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      skip: pageable.offset,
      take: pageable.limit,
      orderBy: sort,
    });
  }

  async count(params: FindMediaDto): Promise<number> {
    const { search, status } = params;
    return this.prisma.media.count({
      where: {
        name: likeField(search),
      },
    });
  }

  async createFromFile(file: Express.Multer.File, user: any, now = dayjs()) {
    const fileNameWithoutExt = basename(file.originalname, extname(file.originalname));
    const readableName = fileNameWithoutExt.replace(/[-_]/g, " ").trim();

    const relativePath = `/uploads/${now.format("YYYY")}/${now.format("MM")}/${file.filename}`;
    const mimeType = file.mimetype;
    const type = this.getMediaType(mimeType);

    const media = await this.prisma.media.create({
      data: {
        name: file.originalname,
        slug: relativePath,
        type,
        mimeType: mimeType,
        size: file.size,
        url: relativePath,
        altText: readableName,
        description: readableName,
        uploadedById: user.id,
        createdUser: user.id,
        updatedUser: user.id,
      },
    });

    return { id: media.id, url: media.url, success: true, type: SuccessType.CREATE };
  }

  getMediaType(mime: string): "IMAGE" | "VIDEO" | "AUDIO" | "PDF" | "DOC" | "OTHER" {
    if (mime.startsWith("image/")) return "IMAGE";
    if (mime.startsWith("video/")) return "VIDEO";
    if (mime.startsWith("audio/")) return "AUDIO";
    if (mime === "application/pdf") return "PDF";
    if (mime === "application/msword" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOC";
    return "OTHER";
  }

  async deleteMany(ids: number[]) {
    const medias = await this.prisma.media.findMany({
      where: { id: { in: ids } },
    });

    const deleted: number[] = [];
    const failed: { id: number; reason: string }[] = [];

    for (const media of medias) {
      const filePath = join(process.cwd(), media.slug);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        deleted.push(media.id);
      } catch (err) {
        failed.push({ id: media.id, reason: "Lỗi khi xoá file vật lý" });
      }
    }

    await this.prisma.media.deleteMany({
      where: { id: { in: deleted } },
    });

    return {
      success: true,
      deleted,
      failed,
    };
  }
}
