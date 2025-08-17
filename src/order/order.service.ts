import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { likeField } from "src/common/functions";
import { FindOrderDto } from "./dto/find-order.dto";
import { User } from "@prisma/client";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order";
import { SuccessType } from "src/common/types";
import { BulkIdsDto } from "./dto/bulk-order.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindOrderDto) {
    const { search, status, deleteFlg, pageable, sort } = params;

    const where: any = {
      ...(deleteFlg !== undefined
        ? { deleteFlg: Number(deleteFlg) }
        : { deleteFlg: 0 }),
      ...(status !== undefined ? { status: Number(status) } : {}),
      ...(search ? { email: likeField(search) } : {}),
    };

    return this.prisma.order.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        note: true,
        inputFileUrl: true,
        outputFileUrl: true,
        status: true,
        createdTime: true,
        deleteFlg: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            service: {
              select: {
                id: true,
                title: true,
                originalPrice: true,
                discountedPrice: true,
              },
            },
            quantity: true,
          },
        },
      },
      skip: pageable.offset,
      take: pageable.limit,
      orderBy: sort,
    });
  }

  async count(params: FindOrderDto): Promise<number> {
    const { search, status, deleteFlg } = params;

    const where: any = {
      ...(deleteFlg !== undefined
        ? { deleteFlg: Number(deleteFlg) }
        : { deleteFlg: 0 }),
      ...(status !== undefined ? { status: Number(status) } : {}),
      ...(search ? { email: likeField(search) } : {}),
    };

    return this.prisma.order.count({ where });
  }

  async createPublic(data: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        userId: null,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        note: data.note,
        inputFileUrl: data.inputFileUrl,
        outputFileUrl: data.outputFileUrl,
        status: data.status || 0,
        createdUser: null,
        updatedUser: null,
        items: {
          create: data.items.map((item) => ({
            service: { connect: { id: item.serviceId } },
            quantity: item.quantity,
            price: Number(item.price),
          })),
        },
      },
      select: { id: true },
    });

    return {
      id: order.id,
      success: true,
      type: SuccessType.CREATE,
    };
  }

  async create(userRequest: User, data: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        userId: userRequest.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        note: data.note,
        inputFileUrl: data.inputFileUrl,
        outputFileUrl: data.outputFileUrl,
        status: data.status || 0,
        createdUser: userRequest.id,
        updatedUser: userRequest.id,
        items: {
          create: data.items.map((item) => ({
            service: { connect: { id: item.serviceId } },
            quantity: item.quantity,
            price: Number(item.price),
          })),
        },
      },
      select: {
        id: true,
      },
    });

    return {
      id: order.id,
      success: true,
      type: SuccessType.CREATE,
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        note: true,
        inputFileUrl: true,
        outputFileUrl: true,
        status: true,
        createdTime: true,
        deleteFlg: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            service: {
              select: {
                id: true,
                title: true,
              },
            },
            serviceId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async update(id: number, userRequest: User, data: UpdateOrderDto) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      throw new NotFoundException("Order not found");
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.order.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          note: data.note,
          inputFileUrl: data.inputFileUrl,
          outputFileUrl: data.outputFileUrl,
          status: data.status,
          updatedUser: userRequest.id,
          updatedTime: new Date(),
        },
      });

      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      if (data.items && data.items.length > 0) {
        await prisma.orderItem.createMany({
          data: data.items.map((item) => ({
            orderId: id,
            serviceId: item.serviceId,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        });
      }
    });

    return {
      id,
      success: true,
      type: SuccessType.UPDATE,
    };
  }

  async bulkSoftDelete(userRequest: User, dto: BulkIdsDto) {
    await this.prisma.order.updateMany({
      where: { id: { in: dto.ids } },
      data: {
        deleteFlg: 1,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      ids: dto.ids,
      success: true,
      type: SuccessType.DELETE,
    };
  }

  async bulkRestore(userRequest: User, dto: BulkIdsDto) {
    await this.prisma.order.updateMany({
      where: { id: { in: dto.ids } },
      data: {
        deleteFlg: 0,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      ids: dto.ids,
      success: true,
      type: SuccessType.RESTORE,
    };
  }

  async bulkHardDelete(userRequest: User, dto: BulkIdsDto) {
    await this.prisma.orderItem.deleteMany({
      where: { orderId: { in: dto.ids } },
    });

    await this.prisma.order.deleteMany({
      where: { id: { in: dto.ids } },
    });

    return {
      ids: dto.ids,
      success: true,
      type: SuccessType.HARD_DELETE,
    };
  }
}
