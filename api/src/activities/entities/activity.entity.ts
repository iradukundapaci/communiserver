import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from "typeorm";
import { Profile } from "src/users/entities/profile.entity";
import { Task } from "./task.entity";
import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Cell } from "src/locations/entities/cell.entity";
import { Village } from "src/locations/entities/village.entity";
import { EActivityStatus } from "../enum/EActivityStatus";

@Entity("activities")
export class Activity extends AbstractEntity {
  @Column({ length: 255 })
  @Index()
  title: string;

  @Column("text")
  description: string;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 50 })
  status: EActivityStatus = EActivityStatus.PENDING;

  @OneToOne(() => Profile)
  @JoinColumn({ name: "organizer_id" })
  organizer: Profile;

  @OneToMany(() => Task, (task) => task.activity, {
    cascade: true,
    eager: true,
  })
  tasks: Task[];

  @ManyToMany(() => Profile, (profile) => profile.activities)
  @JoinTable({
    name: "activity_participants",
    joinColumn: { name: "activity_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "profile_id", referencedColumnName: "id" },
  })
  participants: Profile[];

  @OneToOne(() => Cell, (cell) => cell.id, { nullable: true, eager: true })
  @JoinColumn({ name: "cell_id" })
  cell: Cell;

  @OneToOne(() => Village, (village) => village.id, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: "village_id" })
  village: Village;
}
