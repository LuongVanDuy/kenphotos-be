import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UseGuards, Post, BadRequestException } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { SettingService } from "./setting.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { Module, Permission } from "src/common/types";
import { CreateManySettingsDto } from "./dto/create-setting.dto";
import { UpdateManySettingsDto } from "./dto/update-setting.dto";

@ApiTags("Settings")
@Controller("settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post(":namespace")
  @Roles({ module: Module.SETTING, permission: Permission.CREATE })
  async createManySettings(@Param("namespace") namespace: string, @Body() body: CreateManySettingsDto) {
    return this.settingService.createMany(namespace, body.settings);
  }

  @Put(":namespace")
  @Roles({ module: Module.SETTING, permission: Permission.UPDATE })
  async updateManySettings(@Param("namespace") namespace: string, @Body() body: UpdateManySettingsDto) {
    return this.settingService.updateMany(namespace, body.settings);
  }
}
