import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsInt, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class OrderItemDto {
  @ApiProperty()
  @IsInt()
  serviceId: number;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty()
  @IsString()
  price: string;
}

export class UpdateOrderDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputFileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  outputFileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
