import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanDto {
  @ApiProperty({
    description: 'ID do usuário que está fazendo o empréstimo',
    type: Number,
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'ID do usuário deve ser um número inteiro' })
  @Min(1, { message: 'ID do usuário deve ser válido' })
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  userId: number;

  @ApiProperty({
    description: 'ID do livro a ser emprestado',
    type: Number,
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'ID do livro deve ser um número inteiro' })
  @Min(1, { message: 'ID do livro deve ser válido' })
  @IsNotEmpty({ message: 'ID do livro é obrigatório' })
  bookId: number;

  @ApiProperty({
    description: 'Data de devolução esperada (formato ISO)',
    type: String,
    example: '2025-01-15',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data deve estar em formato ISO' })
  returnDate?: string;
}
