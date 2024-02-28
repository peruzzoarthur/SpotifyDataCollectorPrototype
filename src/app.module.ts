import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { ArtistsModule } from './artists/artists.module';
import { GenresModule } from './genres/genres.module';
import { CountriesModule } from './countries/countries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        LASTFM_KEY: Joi.string().required(),
        SPOTIFY_CLIENT_ID: Joi.string().required(),
        SPOTIFY_SECRET: Joi.string().required(),
        OA_KEY: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    // UsersModule,
    ArtistsModule,
    GenresModule,
    CountriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
