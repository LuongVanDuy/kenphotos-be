import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UseGuards, Post, BadRequestException } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { SettingService } from "./setting.service";
@ApiTags("Settings Public")
@Controller("public/settings")
export class SettingPublicController {
  constructor(private readonly settingService: SettingService) {}

  @Get(":namespace")
  async getSettingsByNamespace(@Param("namespace") namespace: string) {
    return this.settingService.getByNamespace(namespace);
  }
}
