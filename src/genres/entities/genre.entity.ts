// genre.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { IsString } from 'class-validator';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  name: string;

  @ManyToMany(() => Artist, (artist) => artist.genres)
  artists: Artist[];
}
