import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateBookDto {
  @ApiProperty({
    description: 'Título do livro',
    type: String,
    example: 'Clean Code - 2nd Edition',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título não pode estar vazio' })
  title?: string;

  @ApiProperty({
    description: 'Autor do livro',
    type: String,
    example: 'Robert C. Martin',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Autor deve ser uma string' })
  @IsNotEmpty({ message: 'Autor não pode estar vazio' })
  author?: string;

  @ApiProperty({
    description: 'Quantidade total de cópias',
    type: Number,
    example: 15,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser no mínimo 1' })
  quantity?: number;

  @ApiProperty({
    description: 'Quantidade disponível para empréstimo',
    type: Number,
    example: 12,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Disponível deve ser um número inteiro' })
  @Min(0, { message: 'Disponível não pode ser negativo' })
  available?: number;

  @ApiProperty({
    description: 'URL da imagem da capa',
    type: String,
    example: 'https://example.com/clean-code-2nd.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'URL da imagem deve ser uma string' })
  imageUrl?: string;
}
