import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class TokenRefreshDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  token: string;
}
