import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Artist } from '../entities/artist.entity';
import {
  artistSavedEntityMock,
  genreSavedEntityMock,
} from '../../utils/mocks/artists.mock';
import { ArtistsController } from '../artists.controller';
import { ArtistsService } from '../artists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from '../../genres/entities/genre.entity';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('setting up config for testing artists controller', () => {
  let app: INestApplication;
  const artistData: Artist = artistSavedEntityMock;

  beforeEach(async () => {
    const artistRepository = {
      create: jest.fn().mockResolvedValue(artistSavedEntityMock),
      save: jest.fn().mockReturnValue(artistSavedEntityMock),
    };

    const genreRepository = {
      create: jest.fn().mockResolvedValue(genreSavedEntityMock),
      save: jest.fn().mockReturnValue(genreSavedEntityMock),
      findOne: jest.fn().mockReturnValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        ArtistsService,
        {
          provide: getRepositoryToken(Artist),
          useValue: artistRepository,
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: genreRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('when creating a new artist', () => {
    describe('and using valid data', () => {
      it('responds with the artist saved data', () => {
        const expectedData = artistData;

        return request(app.getHttpServer())
          .post('/artists')
          .send({
            name: 'The Ogre Magixx',
            genres: ['Ogre Music', 'Midas Multicast Deephouse'],
          })
          .expect(201)
          .expect(expectedData);
      });
    });

    describe('and using invalid data', () => {
      it('throws an error for the empty name case', () => {
        return request(app.getHttpServer())
          .post('/artists')
          .send({
            name: '',
            genres: [],
          })
          .expect(400)
          .expect((res) => {
            const errorBody = res.body;
            expect(errorBody).toHaveProperty('message');
            expect(errorBody.message).toBeInstanceOf(Array);
            expect(errorBody.message).toContain('name should not be empty');
            expect(errorBody).toHaveProperty('error', 'Bad Request');
            expect(errorBody).toHaveProperty('statusCode', 400);
          });
      });

      it('throws an error when the genres array passed has a argument of !isString type', () => {
        return request(app.getHttpServer())
          .post('/artists')
          .send({
            name: 'The Dire Creeps',
            genres: ['Meele music', 'Ranged music', 666],
          })
          .expect(400)
          .expect((res) => {
            const errorBody = res.body;
            expect(errorBody).toHaveProperty('message');
            expect(errorBody.message).toBeInstanceOf(Array);
            expect(errorBody.message).toContain(
              'Each element in genres must be a string',
            );
            expect(errorBody).toHaveProperty('error', 'Bad Request');
            expect(errorBody).toHaveProperty('statusCode', 400);
          });
      });

      it('throws an error when passed a type that is not an array to genres', () => {
        return request(app.getHttpServer())
          .post('/artists')
          .send({ name: 'Los Mutantes', genres: 'Mutation Brazilian Rock' })
          .expect(400)
          .expect((res) => {
            const errorBody = res.body;
            expect(errorBody).toHaveProperty('message');
            expect(errorBody.message).toBeInstanceOf(Array);
            expect(errorBody.message).toContain('genres must be an array');
            expect(errorBody).toHaveProperty('error', 'Bad Request');
            expect(errorBody).toHaveProperty('statusCode', 400);
          });
      });
    });
  });
});

// import { Repository } from 'typeorm';
// import { ArtistsController } from '../artists.controller';
// import { ArtistsService } from '../artists.service';
// import { CreateArtistDto } from '../dto/create-artist.dto';
// import { Artist } from '../entities/artist.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Test, TestingModule } from '@nestjs/testing';
// import { Genre } from '../../genres/entities/genre.entity';
// import {
//   artistCreatedEntityMock,
//   artistCreatedWithoutGenresMock,
//   artistDtoMock,
//   artistSavedEntityMock,
//   artistSavedWithoutGenresMock,
//   genreCreatedEntityMock,
//   genreSavedEntityMock,
// } from '../../utils/mocks/artists.mock';

// describe('setting up for testing artists controller', () => {
//   let artistsService: ArtistsService;
//   let artistRepository: Repository<Artist>;
//   let genreRepository: Repository<Genre>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ArtistsService,
//         {
//           provide: getRepositoryToken(Artist),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(Genre),
//           useClass: Repository,
//         },
//       ],
//       controllers: [ArtistsController],
//     }).compile();

//     artistsService = module.get<ArtistsService>(ArtistsService);
//     artistRepository = module.get<Repository<Artist>>(
//       getRepositoryToken(Artist),
//     );
//     genreRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
//   });
//   describe('Creating Artist', () => {
//     it('should create a new artist with valid input data', async () => {
//       jest
//         .spyOn(genreRepository, 'findOne')
//         .mockResolvedValueOnce(genreSavedEntityMock)
//         .mockResolvedValueOnce(null);
//       jest
//         .spyOn(genreRepository, 'create')
//         .mockReturnValue(genreCreatedEntityMock);
//       jest
//         .spyOn(genreRepository, 'save')
//         .mockResolvedValue(genreSavedEntityMock);
//       jest;
//       jest
//         .spyOn(artistRepository, 'create')
//         .mockReturnValue(artistCreatedEntityMock);
//       jest
//         .spyOn(artistRepository, 'save')
//         .mockResolvedValue(artistSavedEntityMock);
//       const controller = new ArtistsController(artistsService);
//       const artistDto: CreateArtistDto = artistDtoMock;
//       const result = await controller.createArtist(artistDto);
//       expect(result).toBeDefined();
//       expect(result.name).toEqual(artistDto.name);
//       expect(result.genres).toEqual(artistCreatedEntityMock.genres);
//     });
//   });

//   // Should create a new artist with minimum input data
//   it('should create a new artist with minimum input data', async () => {
//     const controller = new ArtistsController(artistsService);
//     const artistWithoutGenreDtoMock: CreateArtistDto = {
//       name: 'The Sound of Nothing',
//       genres: [],
//     };
//     jest
//       .spyOn(artistRepository, 'create')
//       .mockReturnValue(artistCreatedWithoutGenresMock);
//     jest
//       .spyOn(artistRepository, 'save')
//       .mockResolvedValue(artistSavedWithoutGenresMock);
//     const result = await controller.createArtist(artistWithoutGenreDtoMock);
//     expect(result).toBeDefined();
//     expect(result.name).toEqual(artistWithoutGenreDtoMock.name);
//     expect(result.genres).toEqual(artistWithoutGenreDtoMock.genres);
//   });

//   // Should throw an error if name is missing
//   it('should throw an error if name is missing', () => {
//     const controller = new ArtistsController(artistsService);
//     const artistDto: CreateArtistDto = {
//       name: '',
//       genres: [],
//     };

//     jest
//       .spyOn(artistRepository, 'create')
//       .mockReturnValue({ name: '', genres: [] });
//     jest
//       .spyOn(artistRepository, 'save')
//       .mockResolvedValue({ name: '', genres: [], id: 'aa-xx-dd-ss-ww-sasdas' });
//     expect(() => {
//       controller.createArtist(artistDto);
//     }).toThrow();
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });
// });
