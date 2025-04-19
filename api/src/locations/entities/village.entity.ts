import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { Cell } from "./cell.entity";
import { AbstractEntity } from "src/__shared__/entities/abstract.entity";

@Entity("villages")
export class Village extends AbstractEntity {
  @Column({ name: 'village_name', nullable: false })
  villageName: string;

  @Column({ name: 'village_leader_id', nullable: false })
  villageLeader: Profile;

  @ManyToOne(() => Cell, (cell) => cell.villages, { nullable: false })
  cell: Cell;
}