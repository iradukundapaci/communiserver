import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingLeaderFields1746802914954 implements MigrationInterface {
    name = 'AddingLeaderFields1746802914954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "houses" ADD "has_representative" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "isibos" ADD "has_leader" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "villages" ADD "has_leader" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "villages" ADD "leader_id" character varying`);
        await queryRunner.query(`ALTER TABLE "cells" ADD "has_leader" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cells" ADD "leader_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cells" DROP COLUMN "leader_id"`);
        await queryRunner.query(`ALTER TABLE "cells" DROP COLUMN "has_leader"`);
        await queryRunner.query(`ALTER TABLE "villages" DROP COLUMN "leader_id"`);
        await queryRunner.query(`ALTER TABLE "villages" DROP COLUMN "has_leader"`);
        await queryRunner.query(`ALTER TABLE "isibos" DROP COLUMN "has_leader"`);
        await queryRunner.query(`ALTER TABLE "houses" DROP COLUMN "has_representative"`);
    }

}
