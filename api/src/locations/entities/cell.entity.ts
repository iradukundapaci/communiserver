import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { Village } from "./village.entity";
import { AbstractEntity } from "src/__shared__/entities/abstract.entity";

@Entity("cells")
export class Cell extends AbstractEntity {
    @Column({name: "cell_name", nullable: false})
    cellName: string;

    @OneToOne(() => Profile, (profile) => profile.id, { nullable: false })
    cellLeader: Profile;

    @OneToMany(() => Village, (village) => village.cell)
    villages: Village[];
}