import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './Role';
import { Place } from './Place';
import { TrafficLog } from './TrafficLog';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  email?: string;

  @ManyToOne(() => Role, (role) => role.users)
  role!: Role;

  @OneToMany(() => Place, (place) => place.user)
  places!: Place[];

  @OneToMany(() => TrafficLog, (trafficLog) => trafficLog.user)
  trafficLogs!: TrafficLog[];
}
