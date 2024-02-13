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
import idIsString from 'src/utils/idIsNumberString';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}
  @Get()
  getAllArtists() {
    return this.artistsService.getAllArtists();
  }

  @Get(':id')
  getArtistById(@Param() { id }: idIsString) {
    return this.artistsService.getArtistById(id);
  }

  @Post()
  async createArtist(@Body() artistDto: CreateArtistDto) {
    return this.artistsService.createArtistWithGenres(artistDto);
  }

  @Patch(':id')
  async updateArtist(
    @Param() { id }: idIsString,
    @Body() artist: UpdateArtistDto,
  ) {
    return this.artistsService.updateArtist(id, artist);
  }

  @Delete(':id')
  async deleteArtist(@Param() { id }: idIsString) {
    return this.artistsService.deleteArtist(id);
  }
}
