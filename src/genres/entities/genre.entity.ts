// genre.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Unique,
} from 'typeorm';
import { IsString } from 'class-validator';
import { Artist } from '../../artists/entities/artist.entity';

@Entity()
@Unique(['name'])
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString()
  name: string;

  @ManyToMany(() => Artist, (artist) => artist.genres)
  artists: Artist[];
}
