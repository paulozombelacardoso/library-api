import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    type: String,
    example: 'John Doe',
    minLength: 1,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  name: string;

  @ApiProperty({
    description: 'Email único do usuário',
    type: String,
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 5 caracteres)',
    type: String,
    example: 'senha123',
    minLength: 5,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(5, { message: 'Senha deve ter no mínimo 5 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Papel/Função do usuário no sistema',
    type: String,
    enum: ['ADMIN', 'LIBRARIAN', 'STUDENT'],
    example: 'STUDENT',
    required: false,
    default: 'STUDENT',
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role deve ser ADMIN, LIBRARIAN ou STUDENT' })
  role?: Role;
}
