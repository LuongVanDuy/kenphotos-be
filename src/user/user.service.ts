import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ConfigService } from "@nestjs/config";
import { FindUserDto } from "./dto/find-user.dto";
import { likeField } from "../common/functions";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private configService: ConfigService) {}

  async findAll(params: FindUserDto) {
    const { search, status, pageable, sort } = params;

    return this.prisma.user.findMany({
      where: {
        email: likeField(search),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
      skip: pageable.offset,
      take: pageable.limit,
      orderBy: sort,
    });
  }

  async count(params: FindUserDto): Promise<number> {
    const { search, status } = params;
    return this.prisma.user.count({
      where: {
        email: likeField(search),
      },
    });
  }
}
