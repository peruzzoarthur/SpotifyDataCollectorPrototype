import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsArray()
  @IsString({ each: true, message: 'Each element in genres must be a string' })
  @IsOptional()
  genres: string[];
}
