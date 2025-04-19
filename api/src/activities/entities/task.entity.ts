import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Activity } from "./activity.entity";

@Entity("tasks")
export class Task extends AbstractEntity {
    @Column({ name: "task_name" })
    name: string;

    @Column({ name: "description" })
    description: string;

    @Column({ name: "completed" , default: false})
    completed: boolean;

    @ManyToOne(() => Activity, (activity) => activity.tasks, { nullable: true })
    activity: Activity;
}