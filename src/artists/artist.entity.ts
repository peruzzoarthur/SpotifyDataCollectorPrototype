import { Genre } from 'src/genres/genre.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public name: string;

  @ManyToMany(() => Genre, { cascade: true })
  @JoinTable()
  public genres: Genre[];
}
