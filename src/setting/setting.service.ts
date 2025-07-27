import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { likeField } from "src/common/functions";
import { UpsertSettingDto } from "./dto/upsert-setting.dto";

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

  async upsertMany(namespace: string, settings: UpsertSettingDto[]) {
    const upserted: string[] = [];

    for (const setting of settings) {
      await this.prisma.setting.upsert({
        where: {
          namespace_key: {
            namespace,
            key: setting.key,
          },
        },
        update: {
          value: setting.value,
          updatedTime: new Date(),
        },
        create: {
          namespace,
          key: setting.key,
          value: setting.value,
          createdTime: new Date(),
          updatedTime: new Date(),
        },
      });

      upserted.push(setting.key);
    }

    return {
      success: true,
      upserted,
    };
  }
}
