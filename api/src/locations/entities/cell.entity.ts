import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Village } from "./village.entity";
import { AbstractEntity } from "src/__shared__/entities/abstract.entity";

@Entity("cells")
export class Cell extends AbstractEntity {
    @Column({name: "cell_name", nullable: false})
    cellName: string;

    @Column({name: "cell_leader_id", nullable: false})
    cellLeader: Profile;

    @OneToMany(() => Village, (village) => village.cell)
    villages: Village[];
}