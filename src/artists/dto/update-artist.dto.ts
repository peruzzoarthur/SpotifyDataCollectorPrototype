import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateArtistDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  genres: string;
}
