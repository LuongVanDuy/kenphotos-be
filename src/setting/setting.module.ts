import { Module } from "@nestjs/common";
import { SettingController } from "./setting.controller";
import { SettingService } from "./setting.service";
import { SettingPublicController } from "./setting-public.controller";

@Module({
  controllers: [SettingController, SettingPublicController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
