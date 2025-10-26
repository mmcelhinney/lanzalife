import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from './Event';
import { TrafficLog } from './TrafficLog';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Event, (event) => event.activity)
  events!: Event[];

  @OneToMany(() => TrafficLog, (trafficLog) => trafficLog.activity)
  trafficLogs!: TrafficLog[];
}
