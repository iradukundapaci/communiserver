import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { Task } from "./task.entity";

@Entity("activities")
export class Activity extends AbstractEntity{
    @Column({name: "name", nullable: false})
    name: String;

    @Column({name: "description", nullable: false})
    description: String;

    @Column({name: "date", nullable: false})
    date: Date;

    @Column({name: "location", nullable: false})
    location: String;

    @OneToOne(() => Profile, (profile) => profile.id)
    @Column({name: "organizer_id", nullable: false})
    organizer: Profile;

    @OneToMany(() => Task, (task) => task.activity)
    tasks: Task[];

    @ManyToMany(() => Profile, (profile) => profile.activities)
    participants: Profile[];
}