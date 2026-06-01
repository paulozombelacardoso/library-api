import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsNotEmpty()
  author?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  available?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
