import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Cell } from "src/locations/entities/cell.entity";
import { House } from "src/locations/entities/house.entity";
import { Isibo } from "src/locations/entities/isibo.entity";
import { Village } from "src/locations/entities/village.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { User } from "./user.entity";

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

  @Column({ name: "is_isibo_leader", default: false })
  isIsiboLeader: boolean;

  @ManyToOne(() => Cell, (cell) => cell.profiles, { eager: true })
  @JoinColumn({ name: "cell_id" })
  cell: Cell;

  @ManyToOne(() => Village, (village) => village.profiles, { eager: true })
  @JoinColumn({ name: "village_id" })
  village: Village;

  @ManyToOne(() => Isibo, (isibo) => isibo.profiles, { eager: true })
  @JoinColumn({ name: "isibo_id" })
  isibo: Isibo;

  @ManyToOne(() => House, (house) => house.members, { eager: true })
  @JoinColumn({ name: "house_id" })
  house: House;

  constructor(
    names: string,
    isVillageLeader: boolean,
    isCellLeader: boolean,
    isIsiboLeader: boolean = false,
    cell: Cell,
    village: Village,
    isibo?: Isibo,
    house?: House,
  ) {
    super();
    this.names = names;
    this.isVillageLeader = isVillageLeader;
    this.isCellLeader = isCellLeader;
    this.isIsiboLeader = isIsiboLeader;
    this.cell = cell;
    this.village = village;
    if (isibo) {
      this.isibo = isibo;
    }

    if (house) {
      this.house = house;
    }
  }
}
