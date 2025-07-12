import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { User } from "src/users/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from "typeorm";
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

  @ManyToMany(() => User)
  @JoinTable({
    name: "report_attendance",
    joinColumn: { name: "report_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
  })
  attendance: User[];

  @Column("text", { nullable: true })
  comment?: string;

  @Column("text", { array: true, nullable: true })
  materialsUsed?: string[];

  @Column("text", { nullable: true })
  challengesFaced?: string;

  @Column("text", { nullable: true })
  suggestions?: string;

  @Column("text", { array: true, nullable: true })
  evidenceUrls?: string[];
}
