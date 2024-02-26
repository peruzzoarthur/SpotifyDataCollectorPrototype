import { Artist } from 'src/artists/entities/artist.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['name', 'countryCode'])
export class Country {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ type: 'double precision' })
  public longitude: number;

  @Column({ type: 'double precision' })
  public latitude: number;

  @Column()
  public name: string;

  @Column()
  public countryCode: string;

  @OneToMany(() => Artist, (artist) => artist.countryCode)
  public artists: Artist[];
}
