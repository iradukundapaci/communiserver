import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Citizen } from "src/locations/entities/citizen.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
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

  @Column({ type: "jsonb", nullable: true })
  attendance: Citizen[];

  @Column("text", { nullable: true })
  comment: string;

  @Column("text", { array: true, nullable: true })
  evidenceUrls: string[];
}
