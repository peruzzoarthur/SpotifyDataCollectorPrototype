import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistNotFoundException } from './exceptions/artistNotFound.exception';
import { Artist } from './entities/artist.entity';
import { Genre } from '../genres/entities/genre.entity'; // Import Genre entity

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private artistsRepository: Repository<Artist>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
  ) {}

  async getAllArtists() {
    return await this.artistsRepository.find();
  }

  async getArtistById(id: string) {
    const artist = await this.artistsRepository.findOne({ where: { id } });
    if (artist) {
      return artist;
    }
    throw new ArtistNotFoundException(id);
  }

  async createArtistWithGenres(artistDto: CreateArtistDto) {
    try {
      let genres: Genre[] = [];

      if (artistDto.genres.length > 0) {
        const genresInRequest = artistDto.genres.map((n) => n);
        const genresInDb = await Promise.all(
          genresInRequest.map((name) =>
            this.genresRepository.findOne({ where: { name } }),
          ),
        );

        // Create genres that do not exist in the database
        genres = await Promise.all(
          genresInDb.map(async (genre, index) => {
            if (!genre) {
              // Genre does not exist in the database, create a new one
              const newGenre = this.genresRepository.create({
                name: artistDto.genres[index],
              });
              return await this.genresRepository.save(newGenre);
            }
            return genre;
          }),
        );
      }

      // Create artist with genre relation...
      const artist = this.artistsRepository.create({
        name: artistDto.name,
        genres: genres,
      });

      return await this.artistsRepository.save(artist);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'Artist with the same name already exists',
        );
      }
      throw error;
    }
  }

  async updateArtist(id: string, artistDto: UpdateArtistDto) {
    try {
      // get the artist that is being updated...
      const artist = await this.getArtistById(id);
      if (!artist) {
        throw new ArtistNotFoundException(id);
      }

      // Check if there is a new genre being added... if yes, add it to genres...
      const genresInRequest = artistDto.genres.map((n) => n);
      const genresInDb = await Promise.all(
        genresInRequest.map((name) =>
          this.genresRepository.findOne({ where: { name } }),
        ),
      );

      // Here each item in the array will be either null (doesn't exist)
      // or the Genre entity (if found in db).

      // Create genres that do not exist in the database
      const genres = await Promise.all(
        genresInDb.map(async (genre, index) => {
          if (!genre) {
            // Genre does not exist in the database, create a new one
            const newGenre = this.genresRepository.create({
              name: artistDto.genres[index],
            });
            return await this.genresRepository.save(newGenre);
          }
          return genre;
        }),
      );

      // Set the artist name to the one passed in the body of request
      artist.name = artistDto.name;
      /// Set the genres to the ones passed in the body of the request
      artist.genres = genres;

      // Save artist with updates set
      return await this.artistsRepository.save(artist);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'Artist with the same name already exists',
        );
      }
      throw error;
    }
  }
  async deleteArtist(id: string) {
    const artist = await this.getArtistById(id);
    if (!artist) {
      throw new ArtistNotFoundException(id);
    }
    return await this.artistsRepository.remove(artist);
  }
}
