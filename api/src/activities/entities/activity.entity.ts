import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Profile } from "src/users/entities/profile.entity";
import { OneToMany, OneToOne, ManyToMany } from "typeorm";
import { Task } from "./task.entity";

@Entity("activities")
export class Activity {
  @ApiProperty({ description: "The unique identifier of the activity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "The title of the activity" })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: "The description of the activity" })
  @Column("text")
  description: string;

  @ApiProperty({ description: "The date and time when the activity starts" })
  @Column({ type: "timestamp" })
  startDate: Date;

  @ApiProperty({ description: "The date and time when the activity ends" })
  @Column({ type: "timestamp" })
  endDate: Date;

  @ApiProperty({ description: "The location where the activity takes place" })
  @Column({ length: 255 })
  location: string;

  @ApiProperty({ description: "The maximum number of participants allowed" })
  @Column({ type: "int" })
  maxParticipants: number;

  @ApiProperty({ description: "The current number of participants" })
  @Column({ type: "int", default: 0 })
  currentParticipants: number;

  @ApiProperty({
    description: "The status of the activity (active, cancelled, completed)",
  })
  @Column({ length: 50, default: "active" })
  status: string;

  @ApiProperty({
    description: "The date and time when the activity was created",
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: "The date and time when the activity was last updated",
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.id)
  organizer: Profile;

  @OneToMany(() => Task, (task) => task.activity)
  tasks: Task[];

  @ManyToMany(() => Profile, (profile) => profile.activities)
  participants: Profile[];
}
