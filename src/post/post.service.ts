import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { likeField } from "src/common/functions";
import { FindPostDto } from "./dto/find-post.dto";
import { SuccessType } from "src/common/types";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post";
import { BulkIdsDto } from "./dto/bulk-post.dto";

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic(params: FindPostDto) {
    const { search, pageable, sort, limitWords } = params;

    const where: any = {
      title: likeField(search),
      status: 1,
      deleteFlg: 0,
    };

    const rawPosts = await this.prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdTime: true,
      },
      skip: pageable.offset,
      take: pageable.limit,
      orderBy: sort,
    });

    const data = rawPosts.map((post) => {
      let content = post.content || "";

      if (limitWords !== undefined) {
        const words = content.trim().split(/\s+/);
        content = words.slice(0, limitWords).join(" ");
      }

      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content,
        author: {
          firstName: post.author.firstName,
          lastName: post.author.lastName,
        },
        createdTime: post.createdTime,
      };
    });

    return data;
  }

  async countPublic(params: FindPostDto): Promise<number> {
    const { search } = params;

    const where: any = {
      status: 1,
      deleteFlg: 0,
      title: likeField(search),
    };

    return this.prisma.post.count({ where });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        slug,
        status: 1,
        deleteFlg: 0,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdTime: true,
        updatedTime: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    return post;
  }

  async findAll(params: FindPostDto) {
    const { search, status, deleteFlg, pageable, sort } = params;

    const where: any = {
      ...(deleteFlg !== undefined ? { deleteFlg: Number(deleteFlg) } : { deleteFlg: 0 }),
      ...(status !== undefined ? { status: Number(status) } : {}),
      title: likeField(search),
    };

    return this.prisma.post.findMany({
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

  async count(params: FindPostDto): Promise<number> {
    const { search, status, deleteFlg } = params;

    const where: any = {
      ...(deleteFlg !== undefined ? { deleteFlg: Number(deleteFlg) } : { deleteFlg: 0 }),
      ...(status !== undefined ? { status: Number(status) } : {}),
      title: likeField(search),
    };

    return this.prisma.post.count({ where });
  }

  async create(userRequest: User, data: CreatePostDto) {
    const baseSlug = data.slug.trim();

    const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseSlug);
    if (!isValidSlug) {
      throw new BadRequestException("Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang.");
    }

    let finalSlug = baseSlug;
    let index = 1;
    while (await this.prisma.post.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${index}`;
      index++;
    }

    if (data.categoryIds && data.categoryIds.length > 0) {
      const existingCategories = await this.prisma.category.findMany({
        where: {
          id: { in: data.categoryIds },
        },
      });

      if (existingCategories.length !== data.categoryIds.length) {
        throw new BadRequestException("Một hoặc nhiều danh mục không tồn tại.");
      }
    }

    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug: finalSlug,
        status: data.status ?? 0,
        password: data.password,
        thumbnail: data.thumbnail,
        authorId: userRequest.id,
        createdUser: userRequest.id,
        updatedUser: userRequest.id,
      },
    });

    if (data.categoryIds && data.categoryIds.length > 0) {
      await this.prisma.postCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({
          postId: post.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    return {
      id: post.id,
      success: true,
      type: SuccessType.CREATE,
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        deleteFlg: 0,
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        slug: true,
        status: true,
        password: true,
        thumbnail: true,
        createdTime: true,
        updatedTime: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    return post;
  }

  async update(userRequest: User, id: number, data: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    let finalSlug = post.slug;
    if (data.slug && data.slug !== post.slug) {
      const baseSlug = data.slug.trim();

      const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseSlug);
      if (!isValidSlug) {
        throw new BadRequestException("Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang.");
      }

      finalSlug = baseSlug;
      let index = 1;

      while (
        await this.prisma.post.findFirst({
          where: {
            slug: finalSlug,
            NOT: { id },
          },
        })
      ) {
        finalSlug = `${baseSlug}-${index++}`;
      }
    }

    if (data.categoryIds && data.categoryIds.length > 0) {
      const foundCategories = await this.prisma.category.findMany({
        where: { id: { in: data.categoryIds } },
      });

      if (foundCategories.length !== data.categoryIds.length) {
        throw new BadRequestException("Một hoặc nhiều danh mục không tồn tại.");
      }

      await this.prisma.postCategory.deleteMany({
        where: { postId: id },
      });

      await this.prisma.postCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({
          postId: id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    await this.prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug: finalSlug,
        status: data.status ?? 0,
        password: data.password ?? null,
        thumbnail: data.thumbnail ?? null,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      id,
      success: true,
      type: SuccessType.UPDATE,
    };
  }

  async bulkSoftDelete(userRequest: User, dto: BulkIdsDto): Promise<any> {
    const { ids } = dto;

    await this.prisma.post.updateMany({
      where: {
        id: { in: ids },
        deleteFlg: 0,
      },
      data: {
        deleteFlg: 1,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      ids,
      success: true,
      type: SuccessType.DELETE,
    };
  }

  async bulkRestore(userRequest: User, dto: BulkIdsDto): Promise<any> {
    const { ids } = dto;

    await this.prisma.post.updateMany({
      where: {
        id: { in: ids },
        deleteFlg: 1,
      },
      data: {
        deleteFlg: 0,
        updatedUser: userRequest.id,
        updatedTime: new Date(),
      },
    });

    return {
      ids,
      success: true,
      type: SuccessType.RESTORE,
    };
  }

  async bulkHardDelete(userRequest: User, dto: BulkIdsDto): Promise<any> {
    const { ids } = dto;

    await this.prisma.post.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      ids,
      success: true,
      type: SuccessType.HARD_DELETE,
    };
  }
}
