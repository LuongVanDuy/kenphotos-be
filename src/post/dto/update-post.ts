import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class TourImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  alt?: string;
}

export class TourLocationDto {
  @IsString()
  title: string;

  @IsString()
  image: string;
}

export class TourScheduleDto {
  @IsString()
  day: string;

  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class DepartureDateDto {
  @IsString()
  departureDate: string;

  @IsInt()
  type: number;
}

export class UpdateTourDto {
  @IsString()
  title: string;

  @IsString()
  thumbnail: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  priceAdult: number;

  @IsInt()
  priceChild: number;

  @IsInt()
  priceBaby: number;

  @IsOptional()
  @IsString()
  priceInclude?: string;

  @IsOptional()
  @IsString()
  priceExclude?: string;

  @IsOptional()
  @IsString()
  childTicket?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourImageDto)
  images?: TourImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartureDateDto)
  departureDate?: DepartureDateDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourLocationDto)
  locations?: TourLocationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourScheduleDto)
  schedules?: TourScheduleDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  categoryIds?: number[];
}
