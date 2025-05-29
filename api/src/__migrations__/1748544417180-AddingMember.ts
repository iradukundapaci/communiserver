import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingMember1748544417180 implements MigrationInterface {
    name = 'AddingMember1748544417180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "report_attendance" ("report_id" uuid NOT NULL, "profile_id" uuid NOT NULL, CONSTRAINT "PK_e2761e5ef1b613e58dfdd728dec" PRIMARY KEY ("report_id", "profile_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5213862af05e74ec90b3041051" ON "report_attendance" ("report_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_60d9a31671bde7798441d13447" ON "report_attendance" ("profile_id") `);
        await queryRunner.query(`ALTER TABLE "isibos" DROP COLUMN "members"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "attendance"`);
        await queryRunner.query(`ALTER TABLE "report_attendance" ADD CONSTRAINT "FK_5213862af05e74ec90b30410510" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "report_attendance" ADD CONSTRAINT "FK_60d9a31671bde7798441d134476" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_attendance" DROP CONSTRAINT "FK_60d9a31671bde7798441d134476"`);
        await queryRunner.query(`ALTER TABLE "report_attendance" DROP CONSTRAINT "FK_5213862af05e74ec90b30410510"`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "attendance" jsonb`);
        await queryRunner.query(`ALTER TABLE "isibos" ADD "members" jsonb`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60d9a31671bde7798441d13447"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5213862af05e74ec90b3041051"`);
        await queryRunner.query(`DROP TABLE "report_attendance"`);
    }

}
