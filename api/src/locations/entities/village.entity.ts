import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Profile } from "src/users/entities/profile.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Cell } from "./cell.entity";
import { Isibo } from "./isibo.entity";

@Entity("villages")
export class Village extends AbstractEntity {
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

  @OneToMany(() => Profile, (profile) => profile.village)
  profiles: Profile[];

  @ManyToOne(() => Cell, (cell) => cell.villages, { nullable: false })
  @JoinColumn({ name: "cell_id" })
  cell: Cell;

  @OneToMany(() => Isibo, (isibo) => isibo.village, {
    nullable: true,
    cascade: true,
  })
  isibos: Isibo[];
}
