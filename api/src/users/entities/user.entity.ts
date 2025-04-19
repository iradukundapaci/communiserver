import { AbstractEntity } from 'src/__shared__/entities/abstract.entity';
import { Entity, Column, OneToOne } from 'typeorm';
import { UserRole } from 'src/__shared__/enums/user-role.enum';
import { Profile } from './profile.entity';

@Entity('users')
export class User extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  role: UserRole;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
