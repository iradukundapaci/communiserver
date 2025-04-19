import { Column, Entity, JoinColumn, ManyToMany, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from 'src/__shared__/entities/abstract.entity';
import { Cell } from 'src/locations/entities/cell.entity';
import { Village } from 'src/locations/entities/village.entity';
import { Activity } from 'src/activities/entities/activity.entity';

@Entity('profiles')
export class Profile extends AbstractEntity {
  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ name: 'profile_image', nullable: true })
  profileImage: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Column({name: 'is_village_leader', default: false})
  isVillageLeader: boolean;
  
  @Column({name: 'is_cell_leader', default: false})
  isCellLeader: boolean;

  @OneToOne(() => Cell, (cell) => cell.id)
  @JoinColumn({ name: 'cell_id' })
  cell: Cell;

  @OneToOne(() => Village, (village) => village.id)
  @JoinColumn({ name: 'village_id' })
  village: Village;

  @ManyToMany(() => Activity, (activity) => activity.participants)
  activities: Activity[];
}
