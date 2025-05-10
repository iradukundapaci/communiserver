import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Isibo } from "./isibo.entity";

@Entity("houses")
export class House extends AbstractEntity {
  @Column({ name: "house_code", nullable: false })
  code: string;

  @Column({ name: "street", nullable: true })
  street: string;

  @Column({ name: "has_representative", default: false })
  hasLeader: boolean;

  @Column({ name: "representative_id", nullable: true })
  leaderId: string;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: "representative_id" })
  representative: Profile;

  @OneToMany(() => Profile, (profile) => profile.house)
  members: Profile[];

  @ManyToOne(() => Isibo, (isibo) => isibo.houses, { nullable: false })
  @JoinColumn({ name: "isibo_id" })
  isibo: Isibo;
}
