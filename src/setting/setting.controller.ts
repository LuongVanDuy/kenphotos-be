import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UseGuards, Post, BadRequestException } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { SettingService } from "./setting.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { Module, Permission } from "src/common/types";
import { UpsertManySettingsDto } from "./dto/upsert-setting.dto";
@ApiTags("Settings")
@Controller("settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get(":namespace")
  @Roles({ module: Module.SETTING, permission: Permission.READ })
  async getSettingsByNamespace(@Param("namespace") namespace: string) {
    return this.settingService.getByNamespace(namespace);
  }

  @Put(":namespace")
  @Roles({ module: Module.SETTING, permission: Permission.UPDATE })
  async upsertManySettings(@Param("namespace") namespace: string, @Body() body: UpsertManySettingsDto) {
    return this.settingService.upsertMany(namespace, body.settings);
  }
}
