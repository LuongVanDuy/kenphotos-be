import { IsString, IsNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateManySettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSettingDto)
  settings: CreateSettingDto[];
}
