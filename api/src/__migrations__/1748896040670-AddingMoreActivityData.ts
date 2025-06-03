import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingMoreActivityData1748896040670 implements MigrationInterface {
    name = 'AddingMoreActivityData1748896040670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "estimatedCost" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "actualCost" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "expectedParticipants" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "actualParticipants" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "totalEstimatedCost" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "totalActualCost" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "expectedFinancialImpact" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "actualFinancialImpact" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalExpectedParticipants" integer`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalPresentParticipants" integer`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "youthParticipants" integer`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "estimatedCost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "actualCost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "expectedParticipants" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "actualParticipants" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalEstimatedCost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "totalActualCost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "expectedFinancialImpact" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "actualFinancialImpact" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "materialsUsed" text array`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "challengesFaced" text`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "suggestions" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "suggestions"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "challengesFaced"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "materialsUsed"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "actualFinancialImpact"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "expectedFinancialImpact"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalActualCost"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalEstimatedCost"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "actualParticipants"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "expectedParticipants"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "actualCost"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "estimatedCost"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "youthParticipants"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalPresentParticipants"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "totalExpectedParticipants"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "actualFinancialImpact"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "expectedFinancialImpact"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "totalActualCost"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "totalEstimatedCost"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "actualParticipants"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "expectedParticipants"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "actualCost"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "estimatedCost"`);
        await queryRunner.query(`ALTER TABLE "activities" ADD "status" character varying(50) NOT NULL`);
    }

}
