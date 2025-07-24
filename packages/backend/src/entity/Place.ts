import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from './Event';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  area!: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude!: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude!: number;

  @Column('text', { nullable: true })
  description?: string;

  @OneToMany(() => Event, (event) => event.place)
  events!: Event[];
}
