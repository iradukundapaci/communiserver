import { MigrationInterface, QueryRunner } from "typeorm";

export class Report1747996267426 implements MigrationInterface {
    name = 'Report1747996267426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_tasks"`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_70482e624fc3c09f6e381f88653" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_70482e624fc3c09f6e381f88653"`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_reports_tasks" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
