import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { likeField } from "src/common/functions";
import { FindServiceDto } from "./dto/find-service.dto";
import { SuccessType } from "src/common/types";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service";
import { BulkIdsDto } from "./dto/bulk-post.dto";

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}
  async findAll(params: FindServiceDto) {
    const { search, status, deleteFlg, pageable, sort } = params;

    const where: any = {
      ...(deleteFlg !== undefined ? { deleteFlg: Number(deleteFlg) } : { deleteFlg: 0 }),
      ...(status !== undefined ? { status: Number(status) } : {}),
      title: likeField(search),
    };

    return this.prisma.service.findMany({
      where,
      select: {
        id: true,
        title: true,
        createdTime: true,
        deleteFlg: true,
        status: true,
      },
      skip: pageable.offset,
      take: pageable.limit,
      orderBy: sort,
    });
  }

  async count(params: FindServiceDto): Promise<number> {
    const { search, status, deleteFlg } = params;

    const where: any = {
      ...(deleteFlg !== undefined ? { deleteFlg: Number(deleteFlg) } : { deleteFlg: 0 }),
      ...(status !== undefined ? { status: Number(status) } : {}),
      title: likeField(search),
    };

    return this.prisma.service.count({ where });
  }

  async create(userRequest: User, data: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: {
        title: data.title,
        content: data.content,
        slug: data.slug,
        type: data.type,
        status: data.status,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        rating: data.rating,
        orderCount: data.orderCount,
        authorId: userRequest.id,

        images: data.images?.length
          ? {
              create: data.images.map((img) => ({
                beforeUrl: img.beforeUrl,
                afterUrl: img.afterUrl,
              })),
            }
          : undefined,

        styles: data.styles?.length
          ? {
              create: data.styles.map((style) => ({
                title: style.title,
                beforeUrl: style.beforeUrl,
                afterUrl: style.afterUrl,
              })),
            }
          : undefined,

        steps: data.steps?.length
          ? {
              create: data.steps.map((step) => ({
                title: step.title,
                content: step.content,
                beforeUrl: step.beforeUrl,
                afterUrl: step.afterUrl,
                sortOrder: step.sortOrder,
              })),
            }
          : undefined,

        idealFors: data.idealFors?.length
          ? {
              create: data.idealFors.map((item) => ({
                label: item.label,
              })),
            }
          : undefined,

        includes: data.includes?.length
          ? {
              create: data.includes.map((item) => ({
                label: item.label,
              })),
            }
          : undefined,

        addOns: data.addOns?.length
          ? {
              create: data.addOns.map((item) => ({
                title: item.title,
                description: item.description,
              })),
            }
          : undefined,
      },
    });

    return {
      id: service.id,
      success: true,
      type: SuccessType.CREATE,
    };
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        status: true,
        type: true,
        originalPrice: true,
        discountedPrice: true,
        rating: true,
        orderCount: true,
        authorId: true,

        createdTime: true,
        createdUser: true,
        updatedTime: true,
        updatedUser: true,

        images: {
          select: {
            id: true,
            beforeUrl: true,
            afterUrl: true,
          },
        },
        styles: {
          select: {
            id: true,
            title: true,
            beforeUrl: true,
            afterUrl: true,
          },
        },
        steps: {
          select: {
            id: true,
            title: true,
            content: true,
            beforeUrl: true,
            afterUrl: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        idealFors: {
          select: {
            id: true,
            label: true,
          },
        },
        includes: {
          select: {
            id: true,
            label: true,
          },
        },
        addOns: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException("Dịch vụ không tồn tại");
    }

    return service;
  }

  async update(userRequest: User, id: number, data: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existing) {
      throw new NotFoundException("Service not found");
    }

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        slug: data.slug,
        status: data.status,
        type: data.type,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        rating: data.rating,
        orderCount: data.orderCount,

        images: {
          deleteMany: {},
          create: data.images?.map((img) => ({
            beforeUrl: img.beforeUrl,
            afterUrl: img.afterUrl,
          })),
        },

        styles: {
          deleteMany: {},
          create: data.styles?.map((style) => ({
            title: style.title,
            beforeUrl: style.beforeUrl,
            afterUrl: style.afterUrl,
          })),
        },

        steps: {
          deleteMany: {},
          create: data.steps?.map((step) => ({
            title: step.title,
            content: step.content,
            beforeUrl: step.beforeUrl,
            afterUrl: step.afterUrl,
            sortOrder: step.sortOrder,
          })),
        },

        idealFors: {
          deleteMany: {},
          create: data.idealFors?.map((item) => ({ label: item.label })),
        },

        includes: {
          deleteMany: {},
          create: data.includes?.map((item) => ({ label: item.label })),
        },

        addOns: {
          deleteMany: {},
          create: data.addOns?.map((item) => ({
            title: item.title,
            description: item.description,
          })),
        },

        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      id: updatedService.id,
      success: true,
      type: SuccessType.UPDATE,
    };
  }

  async bulkSoftDelete(userRequest: User, dto: BulkIdsDto) {
    const { ids } = dto;

    const existingServices = await this.prisma.service.findMany({
      where: {
        id: { in: ids },
        deleteFlg: 0,
      },
      select: { id: true },
    });

    if (existingServices.length === 0) {
      throw new NotFoundException("Không có dịch vụ nào hợp lệ để xoá");
    }

    await this.prisma.service.updateMany({
      where: {
        id: { in: existingServices.map((s) => s.id) },
      },
      data: {
        deleteFlg: 1,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      ids: existingServices.map((s) => s.id),
      success: true,
      type: SuccessType.DELETE,
    };
  }

  async bulkRestore(userRequest: User, dto: BulkIdsDto) {
    const { ids } = dto;

    const deletedServices = await this.prisma.service.findMany({
      where: {
        id: { in: ids },
        deleteFlg: 1,
      },
      select: { id: true },
    });

    if (deletedServices.length === 0) {
      throw new NotFoundException("Không có dịch vụ nào hợp lệ để khôi phục");
    }

    await this.prisma.service.updateMany({
      where: {
        id: { in: deletedServices.map((s) => s.id) },
      },
      data: {
        deleteFlg: 0,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      ids: deletedServices.map((s) => s.id),
      success: true,
      type: SuccessType.RESTORE,
    };
  }

  async bulkHardDelete(userRequest: User, dto: BulkIdsDto) {
    const { ids } = dto;

    const existingServices = await this.prisma.service.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (existingServices.length === 0) {
      throw new NotFoundException("Không có dịch vụ nào hợp lệ để xoá vĩnh viễn");
    }

    const idList = existingServices.map((s) => s.id);

    await Promise.all([
      this.prisma.serviceImage.deleteMany({ where: { serviceId: { in: idList } } }),
      this.prisma.serviceStyle.deleteMany({ where: { serviceId: { in: idList } } }),
      this.prisma.serviceStep.deleteMany({ where: { serviceId: { in: idList } } }),
      this.prisma.serviceIdealFor.deleteMany({ where: { serviceId: { in: idList } } }),
      this.prisma.serviceInclude.deleteMany({ where: { serviceId: { in: idList } } }),
      this.prisma.serviceAddOn.deleteMany({ where: { serviceId: { in: idList } } }),
    ]);

    await this.prisma.service.deleteMany({ where: { id: { in: idList } } });

    return {
      ids: idList,
      success: true,
      type: SuccessType.HARD_DELETE,
    };
  }
}
