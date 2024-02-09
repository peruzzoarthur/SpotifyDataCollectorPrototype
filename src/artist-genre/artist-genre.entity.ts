// artist-genre.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Artist } from '../artists/artist.entity';
import { Genre } from '../genres/genre.entity';

@Entity()
export class ArtistGenre {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Artist, { eager: true })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @ManyToOne(() => Genre, { eager: true })
  @JoinColumn({ name: 'genreId' })
  genre: Genre;
}
