import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Genre } from 'src/genres/genre.entity';

export class CreateArtistDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  genres: Genre;
}
