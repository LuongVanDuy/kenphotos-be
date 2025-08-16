import {  Body, Controller, ForbiddenException, Get, Param, Post, Query  } from "@nestjs/common";
import {  ApiTags } from "@nestjs/swagger";

import { SettingService } from "./setting.service";
@ApiTags("Settings Public")
@Controller("public/settings")
export class SettingPublicController {
  constructor(private readonly settingService: SettingService) {}
  @Get()
  async getSettingsByNamespaces(@Query('namespaces') namespaces: string) {
    const namespaceArray = namespaces ? namespaces.split(',') : [];
    return this.settingService.getByNamespaces(namespaceArray);
  }


  @Get(":namespace")
  async getSettingsByNamespace(@Param("namespace") namespace: string) {
    return this.settingService.getByNamespace(namespace);
  }
}
