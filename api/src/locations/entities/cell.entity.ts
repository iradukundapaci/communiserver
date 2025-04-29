import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Village } from "./village.entity";
import { AbstractEntity } from "src/__shared__/entities/abstract.entity";

@Entity("cells")
export class Cell extends AbstractEntity {
  @Column({ name: "cell_name", nullable: false, unique: true })
  cellName: string;

  @OneToMany(() => Profile, (profile) => profile.cell)
  profiles: Profile[];

  @OneToMany(() => Village, (village) => village.cell, {
    nullable: true,
    cascade: true,
  })
  villages: Village[];
}
