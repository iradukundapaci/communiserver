import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTaskRelationship1747762062858 implements MigrationInterface {
  name = "ChangeTaskRelationship1747762062858";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "REL_484c13bbb2690a2cdecb38267d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "REL_484c13bbb2690a2cdecb38267d" UNIQUE ("village_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
