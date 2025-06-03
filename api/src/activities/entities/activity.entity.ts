import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Village } from "src/locations/entities/village.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Task } from "./task.entity";

@Entity("activities")
export class Activity extends AbstractEntity {
  @Column({ length: 255 })
  @Index()
  title: string;

  @Column("text")
  description: string;

  @Column({ type: "timestamptz" })
  date: Date;

  @OneToMany(() => Task, (task) => task.activity, {
    cascade: true,
  })
  tasks: Task[];

  @ManyToOne(() => Village, (village) => village.id, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: "village_id" })
  village: Village;
}
