import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistsService } from './artists.service';
import idIsNumberString from 'src/utils/idIsNumberString';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}
  @Get()
  getAllArtists() {
    return this.artistsService.getAllArtists();
  }

  @Get(':id')
  getArtistById(@Param() { id }: idIsNumberString) {
    return this.artistsService.getArtistById(Number(id));
  }

  @Post()
  async createArtist(
    @Body() request: { artist: CreateArtistDto; genres: string[] },
  ) {
    const { artist, genres } = request;
    return this.artistsService.createArtistWithGenres(artist, genres);
  }

  @Patch(':id')
  async updateArtist(
    @Param() { id }: idIsNumberString,
    @Body() artist: UpdateArtistDto,
  ) {
    return this.artistsService.updateArtist(Number(id), artist);
  }

  @Delete(':id')
  async deleteArtist(@Param() { id }: idIsNumberString) {
    return this.artistsService.deleteArtist(Number(id));
  }
}
