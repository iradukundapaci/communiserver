import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Citizen } from "src/locations/entities/citizen.entity";
import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { Activity } from "./activity.entity";
import { Task } from "./task.entity";

@Entity("reports")
export class Report extends AbstractEntity {
  @ManyToOne(() => Activity, { nullable: false })
  activity: Activity;

  @OneToOne(() => Task, { nullable: false })
  task: Task;

  @Column({ type: "jsonb", nullable: true })
  attendance: Citizen[];

  @Column("text", { nullable: true })
  comment: string;

  @Column("text", { array: true, nullable: true })
  evidenceUrls: string[];
}
