import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateArtistDto,
  CreateArtistsFromSpotify,
} from './dto/create-artist.dto';
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
import {
  MaxInt,
  Playlist,
  SimplifiedArtist,
  SpotifyApi,
  TrackItem,
} from '@spotify/web-api-ts-sdk';

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
        countryCode: '?',
      });

      const savedArtist = await this.artistsRepository.save(artist);

      return savedArtist;
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

  async getArtistSummary() {
    const allArtists = await this.artistsRepository.find();
    const names = allArtists.map((a) => a.name);
    console.log(names.length);

    await Promise.all(
      names.map(async (name, index) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, index * 500));
          console.log(`👺 ${index}: ${name}`);

          const artist = await this.artistsRepository.findOne({
            where: { name },
          });

          if (artist.summary !== null) {
            return;
          }
          const apiUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${name}&api_key=${this.configService.get('LASTFM_KEY')}&format=json`;
          const { data }: { data: ArtistInfoLastFmResponseType } =
            await axios.get(apiUrl);

          if (
            data.artist === undefined ||
            data.artist.bio === undefined ||
            data.artist.bio.summary === undefined
          ) {
            return;
          }
          artist.summary = data.artist.bio.summary;
          const savedArtist = await this.artistsRepository.save(artist);
          return savedArtist;
        } catch (error) {
          throw new Error(`${error.message}`);
        }
      }),
    );
    return allArtists;
  }

  async setArtistCountry() {
    const artists = (await this.artistsRepository.find())
      .filter((a) => a.countryCode === '?' && a.summary !== null)
      .slice(0, 100);
    console.log(artists);

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
          // const delay = (ms) => {
          //   new Promise((resolve) => setTimeout(resolve, ms));
          //   console.log(`${index + 1}: ${a.name}`);
          // };
          // const delayDuration = 10000; // Adjust this value based on your requirements
          // await delay(delayDuration);
          await new Promise((resolve) => setTimeout(resolve, index * 500)); // Todo --- Test this delay here
          console.log(`🤖 #${index + 1} Calling Ma'Bot on artist ${a.name}`);

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

  async createArtistsFromPlaylist(
    createArtistFromPlaylistDto: CreateArtistsFromSpotify,
  ) {
    // Initialize spotify sdk
    const sdk = SpotifyApi.withClientCredentials(
      this.configService.get('SPOTIFY_CLIENT_ID'),
      this.configService.get('SPOTIFY_SECRET'),
      ['playlist-read-private', 'playlist-read-collaborative'],
    );
    // Get the playlist based on its id
    const getPlaylist = await sdk.playlists.getPlaylist(
      createArtistFromPlaylistDto.id,
    );
    // Create the promises based on the items from the playlist
    const createPromises = getPlaylist.tracks.items
      // .slice(0, 1) // TODO slice for testing purposes
      .map(async (item) => {
        const track = item.track;
        const artists: SimplifiedArtist[] = [];
        // Loop through all the artists of each track
        for (let index = 0; index < track.artists.length; index++) {
          try {
            // Check if the artist is already saved on db...
            const isArtistInDb = await this.artistsRepository.findOne({
              where: {
                name: track.artists[index].name,
              },
            });
            // If not, call the create method on it and push it to an array that keeps track of the saved artists
            if (!isArtistInDb) {
              const genres = (await sdk.artists.get(track.artists[index].id))
                .genres;
              console.log(
                `Calling create on artist: ${track.artists[index].name}`,
              );
              const create = this.createArtistWithGenres({
                name: track.artists[index].name,
                genres: genres,
                imageUrl: track.album.images[0]?.url ?? 'undefined',
                spotifyId: track.id,
                spotifyUri: track.uri,
                user: getPlaylist.owner.display_name,
                // countryCode: undefined,
              });
              await create;
              artists.push(track.artists[index]);
            }
          } catch (error) {
            console.error(`Error creating artist: ${error.message}`);
          }
        }
        return artists;
      });
    // Resolve the promises
    try {
      const results = await Promise.all(createPromises);
      return results;
    } catch (error) {
      console.error(`Error resolving artist promise: ${error.message}`);
    }
  }

  async createArtistsFromUserPlaylists(
    createArtistsFromUsersPlaylistsDto: CreateArtistsFromSpotify,
  ) {
    // Initialize spotify sdk
    const sdk = SpotifyApi.withClientCredentials(
      this.configService.get('SPOTIFY_CLIENT_ID'),
      this.configService.get('SPOTIFY_SECRET'),
      ['playlist-read-private', 'playlist-read-collaborative'],
    );

    // Check the total number of playlists that the user has
    const total: number = (
      await sdk.playlists.getUsersPlaylists(
        createArtistsFromUsersPlaylistsDto.id,
      )
    ).total;

    // Do nothing if user has no playlists
    if (total < 1) {
      return null;
    }
    // Set variables in order to deal with pagination
    let offset: number = 0;
    const playlists: Playlist<TrackItem>[] = [];
    const limit: MaxInt<50> = 25;
    const savedPlaylists: string[] = [];
    // Get page of the user's playlists

    try {
      while (offset <= total) {
        const userPlaylists = await sdk.playlists.getUsersPlaylists(
          createArtistsFromUsersPlaylistsDto.id,
          limit,
          offset,
        );
        const items = userPlaylists.items;
        items.map((i) => playlists.push(i));
        offset += limit;
      }
    } catch (error) {
      console.error(`Error inside while loop: ${error.message}`);
    }
    // Create the promises based on the list extracted from the page
    const createPromises = playlists.map(async (playlist, index) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, index * 500));
        console.log(
          `👹 #${index + 1} Calling function on playlist ${playlist.name}`,
        );
        const create = this.createArtistsFromPlaylist({ id: playlist.id });
        await create;
        savedPlaylists.push(playlist.name);
        return savedPlaylists;
      } catch (error) {
        console.error(
          `Error creating promises at ${playlist.name} --- ${error}`,
        );
      }
    });

    // Await promises to resolve
    try {
      const result = await Promise.all(createPromises);
      return result[0];
    } catch (error) {
      console.error(`Error resolving promises: ${error.message}`);
    }
  }
}
