import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistNotFoundException } from './exceptions/artistNotFound.exception';
import { Artist } from './entities/artist.entity';
import { Genre } from '../genres/entities/genre.entity'; // Import Genre entity
import { formatTimestampToDate } from '../utils/formatTimestampToDate';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ArtistInfoLastFmResponseType } from './types/ArtistInfoLastFmResponseType';
import OpenAI from 'openai';
import { Country } from 'src/countries/entities/country.entity';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private artistsRepository: Repository<Artist>,
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
    private readonly configService: ConfigService,
  ) {}

  // ##################### CRUD #############################
  async getAllArtists(total?: number) {
    if (total) {
      return await this.artistsRepository.find({
        take: total,
        relations: ['genres'],
      });
    }
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
      const timestampNow = Date.now().toString();

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
                timestamp: timestampNow,
                createdAt: formatTimestampToDate(timestampNow),
                discoveredBy: artistDto.user,
              });
              return await this.genresRepository.save(newGenre);
            }
            return genre;
          }),
        );
      }
      // Set timestamp now
      // Create artist with genre relation...
      const artist = this.artistsRepository.create({
        name: artistDto.name,
        genres: genres,
        timestamp: timestampNow,
        createdAt: formatTimestampToDate(timestampNow),
        discoveredBy: artistDto.user,
        spotifyId: artistDto.spotifyId,
        imageUrl: artistDto.imageUrl,
        spotifyUri: artistDto.spotifyUri,
      });

      return await this.artistsRepository.save(artist);
    } catch (error) {
      if (error.code === '23505') {
        return null;
        // throw new BadRequestException(
        //   'Artist with the same name already exists',
        // );
      }
      return null;
      // throw error;
    }

    // TODO  this is the proper action to take in my context??
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

  // ##################### CRUD END #############################

  // ##################### ADD SUMMARY AND COUNTRIES #############################

  async getArtistExtraInfo() {
    const allArtists = await this.artistsRepository.find();
    const names = allArtists.map((a) => a.name);
    console.log(names.length);
    // const summariesArray: { name: string; summary: string }[] = [];

    await Promise.all(
      names.map(async (name, index) => {
        try {
          setTimeout(() => console.log(`${index}`), 5000);
          // console.log(artist);
          // console.log(index);
          const artist = await this.artistsRepository.findOne({
            where: { name },
          });

          if (artist.summary !== null) {
            return;
          }
          const apiUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${name}&api_key=${this.configService.get('LASTFM_KEY')}&format=json`;
          // console.log(apiUrl);
          const { data }: { data: ArtistInfoLastFmResponseType } =
            await axios.get(apiUrl);

          // if (
          //   data.artist === undefined ||
          //   data.artist.bio === undefined ||
          //   data.artist.bio.summary === undefined
          // ) {
          //   return;
          // }
          artist.summary = data.artist.bio.summary;
          const savedArtist = await this.artistsRepository.save(artist);
          console.log(savedArtist);
          return savedArtist;
        } catch (error) {
          throw new Error();
        }
      }),
    );
    return allArtists;
  }

  async setArtistCountry() {
    const artists = (await this.artistsRepository.find())
      .filter((a) => a.country === null && a.summary !== null)
      .slice(0, 100);
    // console.log(artists);

    const openai = new OpenAI({
      apiKey: this.configService.get('OA_KEY'),
    });

    const countries: { name: string; countryCode: string }[] =
      await Promise.all(
        artists.map(async (a, index) => {
          // in the case the artist only has the <a> last.fm... <a/> in the summary

          if (a.summary === null) {
            return;
          }
          if (a.summary.length <= 300) {
            a.country = undefined;
            await this.artistsRepository.save(a);
          }

          // Introduce a delay between requests to avoid rate limiting
          const delay = (ms) => {
            new Promise((resolve) => setTimeout(resolve, ms));
            console.log(`${index + 1}: ${a.name}`);
          };
          const delayDuration = 10000; // Adjust this value based on your requirements
          await delay(delayDuration);

          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `Based on this text: ${a.summary}. Return ONLY the country code of the musician or band. The answer must be ONLY the country code, if not possible to identify just return undefined.`,
              },
            ],
            temperature: 0.5,
            max_tokens: 64,
            top_p: 1,
          });
          a.countryCode = response.choices[0].message.content;
          await this.artistsRepository.save(a);
          console.log(`✅ called save on ${a.name}`);
          return {
            name: a.name,
            countryCode: response.choices[0].message.content,
          };
        }),
      );

    return countries;
  }

  async upCountry(): Promise<void> {
    const artistsWithNullCountryId = await this.artistsRepository.find({
      where: {
        countryId: null,
      },
    });

    for (const artist of artistsWithNullCountryId) {
      const country = await this.countriesRepository.findOne({
        where: {
          countryCode: artist.countryCode,
        },
      });

      if (country) {
        artist.country = country;
        await this.artistsRepository.save(artist);
      }
    }
  }

  // ##################### COLLECT DATA FROM A SPOTIFY PLAYLIST #############################

  async getArtistsFromPlaylist() {
    const sdk = SpotifyApi.withClientCredentials(
      this.configService.get('SPOTIFY_CLIENT_ID'),
      this.configService.get('SPOTIFY_SECRET'),
      ['playlist-read-private', 'playlist-read-collaborative'],
    );

    const playlistId = '1inIN4sSDbqD6tMUjqykTT';
    const getPlaylist = await sdk.playlists.getPlaylist(playlistId);

    const createPromises = getPlaylist.tracks.items.map(async (item) => {
      const track = item.track;
      const isArtistInDb = await this.artistsRepository.findOne({
        where: {
          name: track.artists[0].name,
        },
      });

      if (!isArtistInDb) {
        const create = this.createArtistWithGenres({
          name: track.artists[0].name,
          genres: ['Music From the Past', 'Beforeman Music'],
          imageUrl: track.album.images[0].url,
          spotifyId: track.id,
          spotifyUri: track.uri,
          user: getPlaylist.owner.display_name,
        });
        return create;
      }
    });
    console.log(createPromises);
    const createResults = await Promise.all(createPromises);

    return createResults.filter((result) => result !== undefined);
  }
}
