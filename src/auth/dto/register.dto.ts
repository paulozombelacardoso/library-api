import { Role } from '@prisma/client';
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(5)
  password: string;

  @IsEnum(Role)
  role?: Role;
}
