import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { District } from "./district.entity";

@Entity("provinces")
export class Province extends AbstractEntity {
  @Column({ name: "name", nullable: false, unique: true })
  name: string;

  @BeforeInsert()
  @BeforeUpdate()
  transformName() {
    if (this.name) {
      this.name = this.name.toUpperCase();
    }
  }

  @OneToMany(() => District, (district) => district.province, {
    nullable: true,
    cascade: true,
  })
  districts: District[];
}
