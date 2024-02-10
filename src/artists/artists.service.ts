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
    return await this.artistsRepository.find({
      relations: ['genres'], // Include genres in the result
    });
  }

  async getArtistById(id: number) {
    const artist = await this.artistsRepository.findOne({
      where: { id },
      relations: ['genres'],
    });
    if (artist) {
      return artist;
    }
    throw new ArtistNotFoundException(id);
  }

  async createArtistWithGenres(artistDto: CreateArtistDto) {
    // Find if genres exist or not in the db.
    try {
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

      // Create artist with genre relation...
      const artist = this.artistsRepository.create({
        name: artistDto.name,
        genres: genres,
      });

      const savedArtist = await this.artistsRepository.save(artist);
      return savedArtist;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'Artist with the same name already exists',
        );
      }
      throw error; // Error for other case
    }
  }

  async updateArtist(id: number, artistDto: UpdateArtistDto) {
    const { genres: genreIds, ...rest } = artistDto;

    // Find genres by their IDs
    const genres = await this.genresRepository.findByIds([genreIds]);

    // Update artist with associated genres
    await this.artistsRepository.update(id, {
      ...rest,
      genres,
    });

    const updatedArtist = await this.artistsRepository.findOne({
      where: { id },
      relations: ['genres'], // Include genres in the result
    });

    if (updatedArtist) {
      return updatedArtist;
    }
    throw new ArtistNotFoundException(id);
  }

  async deleteArtist(id: number) {
    const deleteResponse = await this.artistsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new ArtistNotFoundException(id);
    }
  }
}

//backup

// async createArtistWithGenres(
//   artistDto: CreateArtistDto,
//   genreNames: string[],
// ) {
//   console.log(artistDto.genres);
//   console.log('this');
//   console.log(genreNames);
//   // Find if genres exist or not in the db.
//   const genresInDb = await Promise.all(
//     genreNames.map((name) =>
//       this.genresRepository.findOne({ where: { name } }),
//     ),
//   );
//   console.log('genresINDb');
//   console.log(genresInDb);

//   // Create genres that do not exist in the database
//   const genres = await Promise.all(
//     genresInDb.map(async (genre, index) => {
//       if (!genre) {
//         // Genre does not exist in the database, create a new one
//         const newGenre = this.genresRepository.create({
//           name: genreNames[index],
//         });
//         return await this.genresRepository.save(newGenre);
//       }
//       return genre;
//     }),
//   );

//   console.log('newGenres');
//   console.log(genres);

//   const artist = this.artistsRepository.create({
//     name: artistDto.name,
//     genres: genres,
//   });

//   const savedArtist = await this.artistsRepository.save(artist);
//   console.log('SaavedArtist');
//   console.log(savedArtist);
//   return artist;
// }
