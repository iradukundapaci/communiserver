import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamingFields1746478881517 implements MigrationInterface {
    name = 'RenamingFields1746478881517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "isibo_id" uuid`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_b543a0f15c3a2dacde09d30ed96" FOREIGN KEY ("isibo_id") REFERENCES "isibos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_b543a0f15c3a2dacde09d30ed96"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "isibo_id"`);
    }

}
