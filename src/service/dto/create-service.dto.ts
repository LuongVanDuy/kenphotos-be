import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsPositive } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class ServiceImageDto {
  @IsOptional()
  @IsString()
  beforeUrl?: string;

  @IsOptional()
  @IsString()
  afterUrl?: string;
}

class ServiceIdealForDto {
  @IsString()
  label: string;
}

class ServiceIncludeDto {
  @IsString()
  label: string;
}

class ServiceAddOnDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  type?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountedPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderCount?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  authorId: number;

  @ApiPropertyOptional({ type: [ServiceImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceImageDto)
  images?: ServiceImageDto[];

  @ApiPropertyOptional({ type: [ServiceIdealForDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceIdealForDto)
  idealFors?: ServiceIdealForDto[];

  @ApiPropertyOptional({ type: [ServiceIncludeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceIncludeDto)
  includes?: ServiceIncludeDto[];

  @ApiPropertyOptional({ type: [ServiceAddOnDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAddOnDto)
  addOns?: ServiceAddOnDto[];
}
