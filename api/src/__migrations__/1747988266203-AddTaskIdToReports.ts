import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskIdToReports1747988266203 implements MigrationInterface {
    name = 'AddTaskIdToReports1747988266203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add taskId column to reports table
        await queryRunner.query(`ALTER TABLE "reports" ADD "taskId" uuid NOT NULL`);
        
        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_reports_tasks" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_tasks"`);
        
        // Drop taskId column
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "taskId"`);
    }
}
