import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Isibo } from "./isibo.entity";

@Entity("houses")
export class House extends AbstractEntity {
  @Column({ name: "code", nullable: false })
  code: string;

  @Column({ name: "address", nullable: false })
  address: string;

  @OneToMany(() => Profile, (profile) => profile.house)
  members: Profile[];

  @ManyToOne(() => Isibo, (isibo) => isibo.houses, { nullable: false })
  @JoinColumn({ name: "isibo_id" })
  isibo: Isibo;
}
