import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { User } from "src/users/entities/user.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { House } from "./house.entity";
import { Village } from "./village.entity";

@Entity("isibos")
export class Isibo extends AbstractEntity {
  @Column({ name: "name", nullable: false })
  name: string;

  @Column({ name: "has_leader", default: false })
  hasLeader: boolean;

  @Column({ name: "leader_id", nullable: true })
  leaderId: string;

  @BeforeInsert()
  @BeforeUpdate()
  transformName() {
    if (this.name) {
      this.name = this.name.toUpperCase();
    }
  }

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "leader_id" })
  leader: User;

  @OneToMany(() => User, (user) => user.isibo)
  users: User[];

  @ManyToOne(() => Village, (village) => village.isibos, { nullable: false })
  @JoinColumn({ name: "village_id" })
  village: Village;

  @OneToMany(() => House, (house) => house.isibo)
  houses: House[];
}
