import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true, message: 'Each element in genres must be a string' })
  // @Transform(({ value }) => value.forEach((a) => a.trim()))
  genres: string[];
}
