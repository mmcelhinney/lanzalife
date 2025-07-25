import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './Role';
import { Place } from './Place';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @ManyToOne(() => Role, (role) => role.users)
  role!: Role;

  @OneToMany(() => Place, (place) => place.user)
  places!: Place[];
}
