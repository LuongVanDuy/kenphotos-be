import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { likeField } from "src/common/functions";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";

@Injectable()
export class SettingService {
  constructor(private prisma: PrismaService) {}

  async getByNamespace(namespace: string): Promise<Record<string, string>> {
    const settings = await this.prisma.setting.findMany({
      where: { namespace },
    });

    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async getValue(namespace: string, key: string): Promise<string | null> {
    const setting = await this.prisma.setting.findUnique({
      where: {
        namespace_key: {
          namespace,
          key,
        },
      },
    });

    return setting?.value ?? null;
  }

  async createMany(namespace: string, settings: CreateSettingDto[]) {
    const created: string[] = [];
    const skipped: string[] = [];

    for (const setting of settings) {
      try {
        await this.prisma.setting.create({
          data: {
            namespace,
            key: setting.key,
            value: setting.value,
            createdTime: new Date(),
            updatedTime: new Date(),
          },
        });
        created.push(setting.key);
      } catch (err) {
        if (err.code === "P2002") {
          skipped.push(setting.key);
        } else {
          throw err;
        }
      }
    }

    return {
      success: true,
      created,
      skipped,
    };
  }

  async updateMany(namespace: string, settings: UpdateSettingDto[]) {
    const updated: string[] = [];
    const skipped: string[] = [];

    for (const setting of settings) {
      const existing = await this.prisma.setting.findUnique({
        where: {
          namespace_key: {
            namespace,
            key: setting.key,
          },
        },
      });

      if (!existing) {
        skipped.push(setting.key);
        continue;
      }

      await this.prisma.setting.update({
        where: {
          namespace_key: {
            namespace,
            key: setting.key,
          },
        },
        data: {
          value: setting.value,
          updatedTime: new Date(),
        },
      });

      updated.push(setting.key);
    }

    return {
      success: true,
      updated,
      skipped,
    };
  }
}
