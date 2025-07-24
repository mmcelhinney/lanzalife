import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from './Event';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Event, (event) => event.activity)
  events!: Event[];
}
