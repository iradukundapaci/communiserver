import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedFields1749121923070 implements MigrationInterface {
    name = 'RemoveUnusedFields1749121923070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalExpectedParticipants"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalPresentParticipants"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "youthParticipants"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalEstimatedCost"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalActualCost"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalActualCost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalEstimatedCost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "youthParticipants" integer`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalPresentParticipants" integer`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalExpectedParticipants" integer`);
    }

}
