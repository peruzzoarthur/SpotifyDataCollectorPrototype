import { IsNotEmpty, IsString } from 'class-validator';

export class SearchArtistDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
