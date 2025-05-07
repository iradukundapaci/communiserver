import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
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
import { District } from "./district.entity";

@Entity("sectors")
export class Sector extends AbstractEntity {
  @Column({ name: "name", nullable: false })
  name: string;

  @BeforeInsert()
  @BeforeUpdate()
  transformName() {
    if (this.name) {
      this.name = this.name.toUpperCase();
    }
  }

  @ManyToOne(() => District, (district) => district.sectors, {
    nullable: false,
  })
  @JoinColumn({ name: "district_id" })
  district: District;

  @OneToMany(() => Cell, (cell) => cell.sector, {
    nullable: true,
    cascade: true,
  })
  cells: Cell[];
}
