import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Place } from './Place';
import { Activity } from './Activity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Place, (place) => place.events)
  place!: Place;

  @ManyToOne(() => Activity, (activity) => activity.events)
  activity!: Activity;

  @Column()
  start_time!: Date;

  @Column()
  end_time!: Date;

  @Column('text', { nullable: true })
  description?: string;
}
