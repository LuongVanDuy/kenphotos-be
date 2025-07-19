import { ApiProperty } from "@nestjs/swagger";

export class SendTestEmailDto {
  @ApiProperty()
  to: string;
}
