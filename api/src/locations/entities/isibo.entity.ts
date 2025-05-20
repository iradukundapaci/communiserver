import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Profile } from "src/users/entities/profile.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Citizen } from "./citizen.entity";
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

  @Column({ type: "jsonb", nullable: true })
  members: Citizen[];

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: "leader_id" })
  leader: Profile;

  @ManyToOne(() => Village, (village) => village.isibos, { nullable: false })
  @JoinColumn({ name: "village_id" })
  village: Village;
}
