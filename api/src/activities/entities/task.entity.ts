import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Isibo } from "src/locations/entities/isibo.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { ETaskStatus } from "../enum/ETaskStatus";
import { Activity } from "./activity.entity";

@Entity("tasks")
export class Task extends AbstractEntity {
  @Column({ length: 255 })
  title: string;

  @Column("text")
  description: string;

  @Column({ length: 50 })
  status: ETaskStatus = ETaskStatus.PENDING;

  @ManyToOne(() => Activity, (activity) => activity.tasks)
  @JoinColumn({ name: "activity_id" })
  activity: Activity;

  @OneToOne(() => Isibo, (isibo) => isibo.id, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: "isibo_id" })
  isibo: Isibo;
}
