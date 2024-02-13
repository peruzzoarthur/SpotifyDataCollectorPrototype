import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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

      console.log(genres);

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
      throw error; // Error for other case
    }
  }

  async updateArtist(id: string, artistDto: UpdateArtistDto) {
    const { genres: genreNames, name: artistName } = artistDto;

    console.log('Genre names:');
    console.log(genreNames);

    console.log('artist name');
    console.log(artistName);

    // Find genres by their names
    const genres = await this.genresRepository.find({
      where: { name: In(genreNames) },
    });
    console.log('genres testing');
    console.log(genres);

    console.log('genres before');
    console.log(genres);
    genres.push({
      id: 'adf5735d-a471-46b7-96a2-23b1f9893a2b',
      name: 'Genreste',
    });
    console.log('genres after');
    console.log(genres);

    const newTestArtist = this.artistsRepository.create({
      name: 'Lucidss',
      genres: [
        {
          id: '84dad765-20c8-43b9-9302-308f5770f14e',
          name: 'Liricalism',
        },
        {
          id: '24084cc2-e11b-4710-85f8-c421de2ecd44',
          name: 'The New Lirical',
        },
      ],
    });
    return await this.artistsRepository.save(newTestArtist);
  }

  async deleteArtist(id: string) {
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
