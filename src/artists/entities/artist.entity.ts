import { Genre } from '../../genres/entities/genre.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['name'])
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column()
  public name: string;

  @ManyToMany(() => Genre, (genre) => genre.artists)
  @JoinTable()
  public genres: Genre[];

  @Column()
  timestamp: string;

  @Column()
  createdAt: string;

  @Column()
  discoveredBy?: string;

  @Column()
  spotifyId?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  spotifyUri?: string;
}
