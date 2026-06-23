import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título do livro',
    type: String,
    example: 'Clean Code',
    minLength: 1,
  })
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  title: string;

  @ApiProperty({
    description: 'Autor do livro',
    type: String,
    example: 'Robert C. Martin',
    minLength: 1,
  })
  @IsString({ message: 'Autor deve ser uma string' })
  @IsNotEmpty({ message: 'Autor é obrigatório' })
  author: string;

  @ApiProperty({
    description: 'ISBN do livro (International Standard Book Number)',
    type: String,
    example: '9780132350884',
    minLength: 10,
  })
  @IsString({ message: 'ISBN deve ser uma string' })
  @IsNotEmpty({ message: 'ISBN é obrigatório' })
  isbn: string;

  @ApiProperty({
    description: 'Quantidade total de cópias do livro',
    type: Number,
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser no mínimo 1' })
  quantity: number;

  @ApiProperty({
    description: 'Quantidade de cópias disponíveis para empréstimo',
    type: Number,
    example: 8,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'Disponível deve ser um número inteiro' })
  @Min(0, { message: 'Disponível não pode ser negativo' })
  available: number;

  @ApiProperty({
    description: 'URL da imagem da capa do livro (opcional)',
    type: String,
    example: 'https://example.com/clean-code.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'URL da imagem deve ser uma string' })
  imageUrl?: string;
}
