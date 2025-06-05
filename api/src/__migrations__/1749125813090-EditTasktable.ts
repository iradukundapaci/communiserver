import { MigrationInterface, QueryRunner } from "typeorm";

export class EditTasktable1749125813090 implements MigrationInterface {
    name = 'EditTasktable1749125813090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "totalEstimatedCost"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "totalActualCost"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "totalActualCost" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "totalEstimatedCost" integer NOT NULL`);
    }

}
