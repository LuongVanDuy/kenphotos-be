import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ConfigService } from "@nestjs/config";
import { FindUserDto } from "./dto/find-user.dto";
import { likeField } from "../common/functions";
import { CreateUserDto } from "./dto/create-user.dto";
import { hashSync } from "bcrypt";
import { SuccessType } from "src/common/types";
import { User } from "@prisma/client";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private configService: ConfigService) {}

  async findAll(params: FindUserDto) {
    const { search, status, deleteFlg, pageable, sort } = params;

    return this.prisma.user.findMany({
      where: {
        email: likeField(search),
        ...(deleteFlg !== undefined ? { deleteFlg } : { deleteFlg: 0 }),
        ...(status !== undefined && { status }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        status: true,
        role: true,
        createdTime: true,
      },
      skip: pageable.offset,
      take: pageable.limit,
      orderBy: sort,
    });
  }

  async count(params: FindUserDto): Promise<number> {
    const { search, status, deleteFlg } = params;
    return this.prisma.user.count({
      where: {
        email: likeField(search),
        ...(deleteFlg !== undefined ? { deleteFlg } : { deleteFlg: 0 }),
        ...(status !== undefined && { status }),
      },
    });
  }

  async create(userRequest: User, data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestException("Email đã tồn tại");
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashSync(data.password, 10),
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        phoneNumber: data.phoneNumber ?? null,
        businessName: data.businessName ?? null,
        country: data.country ?? null,
        timezone: data.timezone ?? null,
        postalCode: data.postalCode ?? null,
        businessWebsite: data.businessWebsite ?? null,

        createdUser: userRequest?.id ?? null,
        updatedUser: userRequest?.id ?? null,
        createdTime: new Date(),
        updatedTime: new Date(),
      },
    });

    return {
      id: user.id,
      success: true,
      type: SuccessType.CREATE,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deleteFlg: 0,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        businessName: true,
        country: true,
        timezone: true,
        postalCode: true,
        businessWebsite: true,
        role: true,
        status: true,
        createdTime: true,
        updatedTime: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    return user;
  }

  async update(userRequest: User, id: number, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || user.deleteFlg === 1) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    let updatedEmail = user.email;

    if (data.email !== undefined && data.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new BadRequestException("Email đã tồn tại");
      }

      updatedEmail = data.email;
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        email: updatedEmail,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        phoneNumber: data.phoneNumber ?? null,
        businessName: data.businessName ?? null,
        country: data.country ?? null,
        timezone: data.timezone ?? null,
        postalCode: data.postalCode ?? null,
        businessWebsite: data.businessWebsite ?? null,
        updatedUser: userRequest?.id ?? null,
        updatedTime: new Date(),
      },
    });

    return {
      id,
      success: true,
      type: SuccessType.UPDATE,
    };
  }

  async delete(userRequest: User, id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deleteFlg === 1) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deleteFlg: 1,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      id,
      success: true,
      type: SuccessType.DELETE,
    };
  }
}
