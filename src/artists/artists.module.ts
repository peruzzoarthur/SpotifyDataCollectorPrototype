import { Module } from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Genre } from '../genres/entities/genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Genre])],
  controllers: [ArtistsController],
  providers: [ArtistsService],
})
export class ArtistsModule {}
