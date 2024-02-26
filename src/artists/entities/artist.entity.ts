import { Country } from 'src/countries/entities/country.entity';
import { Genre } from '../../genres/entities/genre.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
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

  @Column({ nullable: true })
  summary?: string;

  @Column({ nullable: true })
  countryCode?: string;

  @ManyToOne(() => Country, (country) => country.artists, { eager: true })
  public country: Country;
}
