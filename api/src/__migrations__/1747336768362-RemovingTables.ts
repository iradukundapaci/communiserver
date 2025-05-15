import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovingTables1747336768362 implements MigrationInterface {
  name = "RemovingTables1747336768362";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_ff7a3309d4af67667187ff672a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_7a5b867cb5a891defd640ae61cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_9430f12c5a1604833f64595a57f"`,
    );
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "startDate"`);
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "endDate"`);
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "location"`);
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "REL_ff7a3309d4af67667187ff672a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP COLUMN "organizer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "REL_7a5b867cb5a891defd640ae61c"`,
    );
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "cell_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "completed"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assigned_to_id"`);
    await queryRunner.query(
      `ALTER TABLE "activities" ADD "date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "status" character varying(50) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "isibo_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "UQ_fb760e32bf46df84b5d86ebafe3" UNIQUE ("isibo_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_fb760e32bf46df84b5d86ebafe3" FOREIGN KEY ("isibo_id") REFERENCES "isibos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_fb760e32bf46df84b5d86ebafe3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "UQ_fb760e32bf46df84b5d86ebafe3"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "isibo_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "date"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "assigned_to_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "completed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "activities" ADD "cell_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "REL_7a5b867cb5a891defd640ae61c" UNIQUE ("cell_id")`,
    );
    await queryRunner.query(`ALTER TABLE "activities" ADD "organizer_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "REL_ff7a3309d4af67667187ff672a" UNIQUE ("organizer_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD "location" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD "endDate" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD "startDate" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_9430f12c5a1604833f64595a57f" FOREIGN KEY ("assigned_to_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_7a5b867cb5a891defd640ae61cd" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_ff7a3309d4af67667187ff672a2" FOREIGN KEY ("organizer_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
