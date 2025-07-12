import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Isibo } from "./isibo.entity";

@Entity("houses")
export class House extends AbstractEntity {
  @Column({ name: "code", nullable: false })
  code: string;

  @Column({ name: "address", nullable: false })
  address: string;

  @OneToMany(() => User, (user) => user.house)
  members: User[];

  @ManyToOne(() => Isibo, (isibo) => isibo.houses, { nullable: false })
  @JoinColumn({ name: "isibo_id" })
  isibo: Isibo;
}
