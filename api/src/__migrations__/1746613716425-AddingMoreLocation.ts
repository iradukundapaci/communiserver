import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingMoreLocation1746613716425 implements MigrationInterface {
  name = "AddingMoreLocation1746613716425";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "provinces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "UQ_5c78199072262966fb68b718095" UNIQUE ("name"), CONSTRAINT "PK_2e4260eedbcad036ec53222e0c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "districts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "province_id" uuid NOT NULL, CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "district_id" uuid NOT NULL, CONSTRAINT "PK_923fdda0dc12f59add7b3a1782f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cells" ADD "sector_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cells" DROP CONSTRAINT "UQ_9ba483b204db4708d9c2aedbe72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "districts" ADD CONSTRAINT "FK_9d451638507b11822dc411a2dfe" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD CONSTRAINT "FK_d3b63a9863908e4afc9f27884b1" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cells" ADD CONSTRAINT "FK_832e55dd1776c257330682bbcff" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cells" DROP CONSTRAINT "FK_832e55dd1776c257330682bbcff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" DROP CONSTRAINT "FK_d3b63a9863908e4afc9f27884b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "districts" DROP CONSTRAINT "FK_9d451638507b11822dc411a2dfe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cells" ADD CONSTRAINT "UQ_9ba483b204db4708d9c2aedbe72" UNIQUE ("name")`,
    );
    await queryRunner.query(`ALTER TABLE "cells" DROP COLUMN "sector_id"`);
    await queryRunner.query(`DROP TABLE "sectors"`);
    await queryRunner.query(`DROP TABLE "districts"`);
    await queryRunner.query(`DROP TABLE "provinces"`);
  }
}
