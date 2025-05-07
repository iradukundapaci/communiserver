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
import { Province } from "./province.entity";
import { Sector } from "./sector.entity";

@Entity("districts")
export class District extends AbstractEntity {
  @Column({ name: "name", nullable: false })
  name: string;

  @BeforeInsert()
  @BeforeUpdate()
  transformName() {
    if (this.name) {
      this.name = this.name.toUpperCase();
    }
  }

  @ManyToOne(() => Province, (province) => province.districts, {
    nullable: false,
  })
  @JoinColumn({ name: "province_id" })
  province: Province;

  @OneToMany(() => Sector, (sector) => sector.district, {
    nullable: true,
    cascade: true,
  })
  sectors: Sector[];
}
