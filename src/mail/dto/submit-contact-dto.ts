import { IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class SubmitContactDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  propertyAddress: string;

  @IsOptional()
  note?: string;
}
