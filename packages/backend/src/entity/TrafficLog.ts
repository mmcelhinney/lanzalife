import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Place } from './Place';
import { Activity } from './Activity';
import { User } from './User';

@Entity()
export class TrafficLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  action!: string; // 'view_place', 'search', 'filter_by_activity', etc.

  @Column({ nullable: true })
  searchQuery?: string; // What was searched for

  @Column({ nullable: true })
  searchFilters?: string; // JSON string of filters applied

  @Column({ nullable: true })
  userAgent?: string; // Browser info

  @Column({ nullable: true })
  ipAddress?: string; // User's IP address

  @Column({ nullable: true })
  referrer?: string; // Where they came from

  @ManyToOne(() => Place, (place) => place.trafficLogs, { nullable: true })
  place?: Place;

  @ManyToOne(() => Activity, (activity) => activity.trafficLogs, { nullable: true })
  activity?: Activity;

  @ManyToOne(() => User, (user) => user.trafficLogs, { nullable: true })
  user?: User;

  @CreateDateColumn()
  createdAt!: Date;
}
