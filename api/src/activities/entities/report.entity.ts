import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Profile } from "src/users/entities/profile.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { Activity } from "./activity.entity";
import { Task } from "./task.entity";

@Entity("reports")
export class Report extends AbstractEntity {
  @ManyToOne(() => Activity, { nullable: false })
  @JoinColumn({ name: "activityId" })
  activity: Activity;

  @ManyToOne(() => Task, { nullable: false })
  @JoinColumn({ name: "taskId" })
  task: Task;

  @ManyToMany(() => Profile)
  @JoinTable({
    name: "report_attendance",
    joinColumn: { name: "report_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "profile_id", referencedColumnName: "id" },
  })
  attendance: Profile[];

  @Column("text", { nullable: true })
  comment: string;

  @Column("text", { array: true, nullable: true })
  evidenceUrls: string[];
}
