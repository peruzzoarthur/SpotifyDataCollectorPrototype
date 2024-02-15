import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Artist } from '../entities/artist.entity';
import { artistSavedEntityMock } from '../../utils/mocks/artists.mock';
import { ArtistsController } from '../artists.controller';
import { ArtistsService } from '../artists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from '../../genres/entities/genre.entity';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  artistRepositoryMock,
  genreRepositoryMock,
} from '../../utils/mocks/repositories.mock';

describe('setting up config for testing artists controller', () => {
  let app: INestApplication;
  const artistData: Artist = artistSavedEntityMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        ArtistsService,
        {
          provide: getRepositoryToken(Artist),
          useValue: artistRepositoryMock,
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: genreRepositoryMock,
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
            genres: ['Ogre Music'],
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
