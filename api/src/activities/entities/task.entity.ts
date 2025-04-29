import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Activity } from "./activity.entity";
import { Profile } from "src/users/entities/profile.entity";

@Entity("tasks")
export class Task extends AbstractEntity {
  @Column({ length: 255 })
  title: string;

  @Column("text")
  description: string;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => Activity, (activity) => activity.tasks)
  @JoinColumn({ name: "activity_id" })
  activity: Activity;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: "assigned_to_id" })
  assignedTo: Profile;
}
