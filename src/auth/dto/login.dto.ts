import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
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
}
