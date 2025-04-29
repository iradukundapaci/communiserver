import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User } from "./user.entity";
import { Cell } from "src/locations/entities/cell.entity";
import { Village } from "src/locations/entities/village.entity";
import { Activity } from "src/activities/entities/activity.entity";

@Entity("profiles")
export class Profile extends AbstractEntity {
  @Column()
  names: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @Column({ name: "is_village_leader", default: false })
  isVillageLeader: boolean;

  @Column({ name: "is_cell_leader", default: false })
  isCellLeader: boolean;

  @ManyToOne(() => Cell, (cell) => cell.profiles)
  @JoinColumn({ name: "cell_id" })
  cell: Cell;

  @ManyToOne(() => Village, (village) => village.profiles)
  @JoinColumn({ name: "village_id" })
  village: Village;

  @ManyToMany(() => Activity, (activity) => activity.participants)
  activities: Activity[];

  constructor(
    names: string,
    isVillageLeader: boolean,
    isCellLeader: boolean,
    cell: Cell,
    village: Village,
  ) {
    super();
    this.names = names;
    this.isVillageLeader = isVillageLeader;
    this.isCellLeader = isCellLeader;
    this.cell = cell;
    this.village = village;
  }
}
