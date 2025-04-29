import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Setting extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  value: string;
}
