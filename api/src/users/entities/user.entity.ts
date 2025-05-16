import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Profile } from "./profile.entity";

@Entity("users")
export class User extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: "timestamptz", default: null, nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true, default: true })
  activated: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  profile: Profile;

  constructor(email: string, phone: string, password: string, role: UserRole) {
    super();
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role;
    this.activated = true;
  }
}
