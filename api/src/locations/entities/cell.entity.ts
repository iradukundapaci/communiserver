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
import { Sector } from "./sector.entity";
import { Village } from "./village.entity";

@Entity("cells")
export class Cell extends AbstractEntity {
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

  @ManyToOne(() => Sector, (sector) => sector.cells, { nullable: false })
  @JoinColumn({ name: "sector_id" })
  sector: Sector;

  @OneToMany(() => User, (user) => user.cell)
  users: User[];

  @OneToMany(() => Village, (village) => village.cell, {
    nullable: true,
    cascade: true,
  })
  villages: Village[];
}
