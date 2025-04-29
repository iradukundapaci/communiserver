import { AbstractEntity } from "src/__shared__/entities/abstract.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToOne, JoinColumn } from "typeorm";

/**
 * Verification Entity
 */
@Entity("verification")
export class Verification extends AbstractEntity {
  @Column({ unique: true })
  verificationCode: string;

  @Column({ type: "timestamp", nullable: true })
  expiresAt: Date;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
