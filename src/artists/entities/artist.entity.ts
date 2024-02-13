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

  @ManyToMany(() => Genre, {
    // cascade: true,
    eager: true,
  })
  @JoinTable()
  public genres: Genre[];
}
