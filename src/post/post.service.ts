import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { likeField } from "src/common/functions";
import { FindPostDto } from "./dto/find-post.dto";

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindPostDto) {
    const { search, status, pageable, sort } = params;

    return this.prisma.post.findMany({
      where: {
        deleteFlg: 0,
        title: likeField(search),
      },
      select: {
        id: true,
        title: true,
        createdTime: true,
        deleteFlg: true,
      },
      skip: pageable.offset,
      take: pageable.limit,
      orderBy: sort,
    });
  }

  async count(params: FindPostDto): Promise<number> {
    const { search, status } = params;
    return this.prisma.post.count({
      where: {
        deleteFlg: 0,
        title: likeField(search),
      },
    });
  }
}
