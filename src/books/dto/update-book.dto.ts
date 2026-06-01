import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsNotEmpty()
  author?: string;

  @IsInt()
  @Min(1)
  quantity?: number;

  @IsInt()
  @Min(0)
  available?: number;
}
