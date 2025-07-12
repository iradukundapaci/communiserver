import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { Cell } from "src/locations/entities/cell.entity";
import { House } from "src/locations/entities/house.entity";
import { Isibo } from "src/locations/entities/isibo.entity";
import { Village } from "src/locations/entities/village.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity("users")
export class User extends AbstractEntity {
  @Column()
  names: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;

  @Column({ name: "is_village_leader", default: false })
  isVillageLeader: boolean;

  @Column({ name: "is_cell_leader", default: false })
  isCellLeader: boolean;

  @Column({ name: "is_isibo_leader", default: false })
  isIsiboLeader: boolean;

  @ManyToOne(() => Cell, (cell) => cell.users, { eager: true })
  @JoinColumn({ name: "cell_id" })
  cell: Cell;

  @ManyToOne(() => Village, (village) => village.users, { eager: true })
  @JoinColumn({ name: "village_id" })
  village: Village;

  @ManyToOne(() => Isibo, (isibo) => isibo.users, { eager: true })
  @JoinColumn({ name: "isibo_id" })
  isibo: Isibo;

  @ManyToOne(() => House, (house) => house.members, { eager: true })
  @JoinColumn({ name: "house_id" })
  house: House;

  constructor(
    email: string,
    phone: string,
    password: string,
    role: UserRole,
    names: string,
    isVillageLeader: boolean = false,
    isCellLeader: boolean = false,
    isIsiboLeader: boolean = false,
    cell?: Cell,
    village?: Village,
    isibo?: Isibo,
    house?: House,
  ) {
    super();
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role;
    this.names = names;
    this.isVillageLeader = isVillageLeader;
    this.isCellLeader = isCellLeader;
    this.isIsiboLeader = isIsiboLeader;
    if (cell) {
      this.cell = cell;
    }
    if (village) {
      this.village = village;
    }
    if (isibo) {
      this.isibo = isibo;
    }
    if (house) {
      this.house = house;
    }
  }
}
