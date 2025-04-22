import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1745333793291 implements MigrationInterface {
    name = 'InitialMigration1745333793291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL`);
    }

}
