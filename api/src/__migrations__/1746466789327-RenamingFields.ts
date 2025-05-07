import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamingFields1746466789327 implements MigrationInterface {
    name = 'RenamingFields1746466789327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "villages" RENAME COLUMN "village_name" TO "name"`);
        await queryRunner.query(`ALTER TABLE "cells" RENAME COLUMN "cell_name" TO "name"`);
        await queryRunner.query(`ALTER TABLE "cells" RENAME CONSTRAINT "UQ_b8dbdb2ce7b89a5651b0798ed5a" TO "UQ_9ba483b204db4708d9c2aedbe72"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cells" RENAME CONSTRAINT "UQ_9ba483b204db4708d9c2aedbe72" TO "UQ_b8dbdb2ce7b89a5651b0798ed5a"`);
        await queryRunner.query(`ALTER TABLE "cells" RENAME COLUMN "name" TO "cell_name"`);
        await queryRunner.query(`ALTER TABLE "villages" RENAME COLUMN "name" TO "village_name"`);
    }

}
