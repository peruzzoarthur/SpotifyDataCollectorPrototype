import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtistsService } from '../artists.service';
import { Artist } from '../entities/artist.entity';
import { Genre } from '../../genres/entities/genre.entity';
import { CreateArtistDto } from '../dto/create-artist.dto';
import {
  artistCreatedEntityMock,
  artistCreatedWithoutGenresMock,
  artistDtoMock,
  artistSavedEntityMock,
  artistSavedWithoutGenresMock,
  genreCreatedEntityMock,
  genreSavedEntityMock,
} from '../../utils/mocks/artists.mock';
import { BadRequestException } from '@nestjs/common';

describe('ArtistsService', () => {
  let service: ArtistsService;
  let artistRepository: Repository<Artist>;
  let genreRepository: Repository<Genre>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: getRepositoryToken(Artist),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Genre),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
    artistRepository = module.get<Repository<Artist>>(
      getRepositoryToken(Artist),
    );
    genreRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
  });

  describe('createArtistWithGenres', () => {
    it('creates an artist when all genres already exist in the database', async () => {
      jest
        .spyOn(genreRepository, 'findOne')
        .mockResolvedValue(genreSavedEntityMock);
      jest
        .spyOn(artistRepository, 'create')
        .mockReturnValue(artistCreatedEntityMock);
      jest
        .spyOn(artistRepository, 'save')
        .mockResolvedValue(artistSavedEntityMock);

      const artistDto: CreateArtistDto = artistDtoMock;

      const result = await service.createArtistWithGenres(artistDto);

      expect(result).toEqual(artistSavedEntityMock);
    });

    it('creates an artist when some genres already exist in the database and some do not', async () => {
      jest
        .spyOn(genreRepository, 'findOne')
        .mockResolvedValueOnce(genreSavedEntityMock)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(genreRepository, 'create')
        .mockReturnValue(genreCreatedEntityMock);
      jest
        .spyOn(genreRepository, 'save')
        .mockResolvedValue(genreSavedEntityMock);
      jest.spyOn(artistRepository, 'create').mockReturnValue({
        name: 'The Ogre Magixx',
        genres: [
          {
            id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
            name: 'Ogre Music',
          },
          {
            id: 'f0fafa21-82d9-4253-9621-cdcfb944484b',
            name: 'Midas Multicast Techno',
          },
        ],
      });
      jest.spyOn(artistRepository, 'save').mockResolvedValue({
        name: 'The Ogre Magixx',
        id: '0e944457-8613-4737-b275-be11a0da6127',
        genres: [
          {
            id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
            name: 'Ogre Music',
          },
          {
            id: 'f0fafa21-82d9-4253-9621-cdcfb944484b',
            name: 'Midas Multicast Techno',
          },
        ],
      });

      const artistDto: CreateArtistDto = {
        name: 'The Ogre Magixx',
        genres: ['Ogre Music', 'Midas Multicast Techno'],
      };

      const result = await service.createArtistWithGenres(artistDto);

      expect(result).toEqual({
        name: 'The Ogre Magixx',
        id: '0e944457-8613-4737-b275-be11a0da6127',
        genres: [
          {
            id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
            name: 'Ogre Music',
          },
          {
            id: 'f0fafa21-82d9-4253-9621-cdcfb944484b',
            name: 'Midas Multicast Techno',
          },
        ],
      });
    });

    it('creates an artist with genres when no genres exist in the database', async () => {
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(genreRepository, 'create')
        .mockReturnValue(genreCreatedEntityMock);
      jest
        .spyOn(genreRepository, 'save')
        .mockResolvedValue(genreSavedEntityMock);
      jest
        .spyOn(artistRepository, 'create')
        .mockReturnValue(artistCreatedEntityMock);
      jest
        .spyOn(artistRepository, 'save')
        .mockResolvedValue(artistSavedEntityMock);

      const artistDto: CreateArtistDto = artistDtoMock;

      const result = await service.createArtistWithGenres(artistDto);

      expect(result).toEqual(artistSavedEntityMock);
    });

    it('throws BadRequestException when artist with the same name already exists in the database', async () => {
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(genreRepository, 'create')
        .mockReturnValue(genreCreatedEntityMock);
      jest
        .spyOn(genreRepository, 'save')
        .mockResolvedValue(genreSavedEntityMock);
      jest
        .spyOn(artistRepository, 'create')
        .mockReturnValue(artistCreatedEntityMock);
      jest.spyOn(artistRepository, 'save').mockRejectedValue({ code: '23505' });

      const artistDto: CreateArtistDto = artistDtoMock;

      await expect(service.createArtistWithGenres(artistDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws no error and return the artist with an empty array of genres', async () => {
      const artistDto: CreateArtistDto = {
        name: 'The Sound of Nothing',
        genres: [],
      };
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(artistRepository, 'create')
        .mockReturnValue(artistCreatedWithoutGenresMock);
      jest
        .spyOn(artistRepository, 'save')
        .mockResolvedValue(artistSavedWithoutGenresMock);
      const result = await service.createArtistWithGenres(artistDto);

      expect(result).toEqual(artistSavedWithoutGenresMock);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
