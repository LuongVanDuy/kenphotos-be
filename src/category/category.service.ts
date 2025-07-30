import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { likeField } from "src/common/functions";
import { FindCategoryDto } from "./dto/find-category.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { SuccessType } from "src/common/types";
import { UpdateCategoryDto } from "./dto/update-category";

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindCategoryDto) {
    const { search, pageable, sort } = params;

    const rawCategories = await this.prisma.category.findMany({
      where: {
        deleteFlg: 0,
        name: likeField(search),
      },
      select: {
        id: true,
        name: true,
        description: true,
        parentId: true,
        isDefault: true,
      },
      orderBy: sort,
    });

    const categoryMap = new Map<number, any>();
    rawCategories.forEach((cat) => categoryMap.set(cat.id, { ...cat, subcategories: [] }));

    const roots: any[] = [];
    rawCategories.forEach((cat) => {
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).subcategories.push(categoryMap.get(cat.id));
      } else {
        roots.push(categoryMap.get(cat.id));
      }
    });

    const flattenCategories = (categories: any[], level = 0): any[] => {
      return categories.flatMap((cat) => {
        const { subcategories, ...rest } = cat;
        return [{ ...rest, level }, ...flattenCategories(subcategories || [], level + 1)];
      });
    };

    const flattened = flattenCategories(roots);

    const start = pageable.offset;
    const end = start + pageable.limit;
    const paginated = flattened.slice(start, end);

    return paginated;
  }

  async count(params: FindCategoryDto): Promise<number> {
    const { search } = params;
    return this.prisma.category.count({
      where: {
        deleteFlg: 0,
        name: likeField(search),
      },
    });
  }

  async create(userRequest: User, data: CreateCategoryDto) {
    const baseSlug = data.slug.trim();

    const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseSlug);
    if (!isValidSlug) {
      throw new NotFoundException("Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang.");
    }

    if (data.parentId !== undefined && data.parentId !== null) {
      const parentExists = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentExists) {
        throw new NotFoundException("Danh mục cha không tồn tại.");
      }
    }

    let finalSlug = baseSlug;
    let index = 1;
    while (await this.prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${index}`;
      index++;
    }

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        createdUser: userRequest.id,
        createdTime: new Date(),
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      id: category.id,
      success: true,
      type: SuccessType.CREATE,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        parentId: true,

        createdTime: true,
        createdUser: true,
        updatedTime: true,
        updatedUser: true,
      },
    });
    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }
    return category;
  }

  async update(userRequest: User, id: number, data: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    if (data.parentId !== undefined && data.parentId !== null) {
      if (data.parentId === id) {
        throw new NotFoundException("Danh mục không thể là cha của chính nó.");
      }

      const parentExists = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentExists) {
        throw new NotFoundException("Danh mục cha không tồn tại.");
      }
    }

    let finalSlug = category.slug;

    if (data.slug) {
      const baseSlug = data.slug.trim();

      const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseSlug);
      if (!isValidSlug) {
        throw new NotFoundException("Slug không hợp lệ. Chỉ được dùng chữ thường, số và dấu gạch ngang.");
      }

      if (baseSlug !== category.slug) {
        finalSlug = baseSlug;
        let index = 1;

        while (
          await this.prisma.category.findFirst({
            where: {
              slug: finalSlug,
              NOT: { id },
            },
          })
        ) {
          finalSlug = `${baseSlug}-${index}`;
          index++;
        }
      }
    }

    await this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      id: category.id,
      success: true,
      type: SuccessType.UPDATE,
    };
  }

  async deleteMany(userRequest: User, ids: number[]): Promise<any> {
    if (!ids.length) {
      throw new BadRequestException("Danh sách ID không được để trống");
    }

    const existing = await this.prisma.category.findMany({
      where: {
        id: { in: ids },
      },
      select: { id: true, isDefault: true },
    });

    const existingIds = existing.map((c) => c.id);
    const notFoundIds = ids.filter((id) => !existingIds.includes(id));

    if (notFoundIds.length) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${notFoundIds.join(", ")}`);
    }

    const defaultCategory = existing.find((c) => c.isDefault);
    if (defaultCategory) {
      throw new BadRequestException("Không thể xóa danh mục mặc định");
    }

    await this.prisma.postCategory.deleteMany({
      where: {
        categoryId: { in: ids },
      },
    });

    await this.prisma.category.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return {
      ids: existingIds,
      success: true,
      type: SuccessType.DELETE,
    };
  }

  async setDefaultCategory(userRequest: User, id: number): Promise<any> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    await this.prisma.category.updateMany({
      data: { isDefault: false },
      where: { isDefault: true },
    });

    await this.prisma.category.update({
      where: { id },
      data: {
        isDefault: true,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      id,
      success: true,
      type: "SET_DEFAULT",
    };
  }
}
