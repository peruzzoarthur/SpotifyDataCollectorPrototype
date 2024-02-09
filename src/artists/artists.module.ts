import { Module } from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './artist.entity';
import { Genre } from 'src/genres/genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Genre])],
  controllers: [ArtistsController],
  providers: [ArtistsService],
})
export class ArtistsModule {}
