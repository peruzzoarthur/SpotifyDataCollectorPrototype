import { Module } from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Genre } from '../genres/entities/genre.entity';
import { ConfigModule } from '@nestjs/config';
import { Country } from 'src/countries/entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Genre, Country]), ConfigModule],
  controllers: [ArtistsController],
  providers: [ArtistsService],
})
export class ArtistsModule {}
