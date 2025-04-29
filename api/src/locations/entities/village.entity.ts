import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Cell } from "./cell.entity";
import { AbstractEntity } from "src/__shared__/entities/abstract.entity";

@Entity("villages")
export class Village extends AbstractEntity {
  @Column({ name: "village_name", nullable: false })
  villageName: string;

  @OneToMany(() => Profile, (profile) => profile.village)
  profiles: Profile[];

  @ManyToOne(() => Cell, (cell) => cell.villages, { nullable: false })
  @JoinColumn({ name: "cell_id" })
  cell: Cell;
}
