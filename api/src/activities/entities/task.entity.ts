import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Isibo } from "src/locations/entities/isibo.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { ETaskStatus } from "../enum/ETaskStatus";
import { Activity } from "./activity.entity";

@Entity("tasks")
@Unique(["activity", "isibo"])
export class Task extends AbstractEntity {
  @Column({ length: 255 })
  title: string;

  @Column("text")
  description: string;

  @Column({ length: 50 })
  status: ETaskStatus = ETaskStatus.PENDING;

  @ManyToOne(() => Activity, (activity) => activity.tasks)
  @JoinColumn({ name: "activity_id" })
  @Index()
  activity: Activity;

  @ManyToOne(() => Isibo, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: "isibo_id" })
  @Index()
  isibo: Isibo;
}
