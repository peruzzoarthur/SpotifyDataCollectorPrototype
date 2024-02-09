import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGenreDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;
}
