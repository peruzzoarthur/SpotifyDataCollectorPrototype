import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistNotFoundException } from './exceptions/artistNotFound.exception';
import { Artist } from './artist.entity';
import { Genre } from '../genres/genre.entity'; // Import Genre entity
// import { CreateGenreDto } from 'src/genres/dto/create-genre.dto';

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
      relations: ['genres'], // Include genres in the result
    });
    if (artist) {
      return artist;
    }
    throw new ArtistNotFoundException(id);
  }

  async createArtistWithGenres(
    artistDto: CreateArtistDto,
    genreNames: string[],
  ) {
    // Find genres by their names
    const genres = await Promise.all(
      genreNames.map((name) =>
        this.genresRepository.findOne({ where: { name } }),
      ),
    );

    // Create a new artist
    const newArtist = this.artistsRepository.create({
      ...artistDto,
      genres: genres, // Assign genres to the artist
    });

    // Save the artist with associated genres
    await this.artistsRepository.save(newArtist);

    return newArtist;
  }

  // async createArtist(artistDto: CreateArtistDto, genre: CreateGenreDto) {
  //   const { genres: genreIds, ...rest } = artistDto;

  //   // Find genres by their IDs
  //   const genres = await this.genresRepository.findByIds([genreIds]);

  //   // Create a new artist with associated genres
  //   const newArtist = this.artistsRepository.create({
  //     ...rest,
  //     genres,
  //   });

  //   await this.artistsRepository.save(newArtist);
  //   return newArtist;
  // }

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
