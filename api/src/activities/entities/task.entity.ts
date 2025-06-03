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

  @Column()
  estimatedCost: number = 0;

  @Column()
  actualCost: number = 0;

  @Column()
  expectedParticipants: number = 0;

  @Column()
  actualParticipants: number = 0;

  @Column()
  totalEstimatedCost: number = 0;
  
  @Column()
  totalActualCost: number = 0;
  
  @Column()
  expectedFinancialImpact: number = 0;

  @Column()
  actualFinancialImpact: number = 0;

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
