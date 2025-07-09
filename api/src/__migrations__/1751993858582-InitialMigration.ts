import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1751993858582 implements MigrationInterface {
    name = 'InitialMigration1751993858582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "provinces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "UQ_5c78199072262966fb68b718095" UNIQUE ("name"), CONSTRAINT "PK_2e4260eedbcad036ec53222e0c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "districts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "province_id" uuid NOT NULL, CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "district_id" uuid NOT NULL, CONSTRAINT "PK_923fdda0dc12f59add7b3a1782f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "houses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "code" character varying NOT NULL, "address" character varying NOT NULL, "isibo_id" uuid NOT NULL, CONSTRAINT "PK_ee6cacb502a4b8590005eb3dc8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "isibos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "has_leader" boolean NOT NULL DEFAULT false, "leader_id" uuid, "village_id" uuid NOT NULL, CONSTRAINT "PK_5e2921bfe9f2820ea8b1fccf8a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "villages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "has_leader" boolean NOT NULL DEFAULT false, "leader_id" character varying, "cell_id" uuid NOT NULL, CONSTRAINT "PK_3d9cf7c71c05c7ef684331317bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cells" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "has_leader" boolean NOT NULL DEFAULT false, "leader_id" character varying, "sector_id" uuid NOT NULL, CONSTRAINT "PK_b9443df02c1a41bc03f264388c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "names" character varying NOT NULL, "is_village_leader" boolean NOT NULL DEFAULT false, "is_cell_leader" boolean NOT NULL DEFAULT false, "is_isibo_leader" boolean NOT NULL DEFAULT false, "cell_id" uuid, "village_id" uuid, "isibo_id" uuid, "house_id" uuid, CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "phone" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, "refreshToken" character varying, "verifiedAt" TIMESTAMP WITH TIME ZONE, "activated" boolean DEFAULT true, "profileId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_b1bda35cdb9a2c1b777f5541d8" UNIQUE ("profileId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "verification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "verificationCode" character varying NOT NULL, "expiresAt" TIMESTAMP, "userId" uuid, CONSTRAINT "UQ_61ecc78f1930df8d99297474fb8" UNIQUE ("verificationCode"), CONSTRAINT "REL_8300048608d8721aea27747b07" UNIQUE ("userId"), CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "description" text NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "village_id" uuid, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_13ed6c247f66cc50e29ebec1da" ON "activities" ("title") `);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "description" text NOT NULL, "status" character varying(50) NOT NULL, "estimatedCost" integer NOT NULL, "actualCost" integer NOT NULL, "expectedParticipants" integer NOT NULL, "actualParticipants" integer NOT NULL, "expectedFinancialImpact" integer NOT NULL, "actualFinancialImpact" integer NOT NULL, "activity_id" uuid, "isibo_id" uuid NOT NULL, CONSTRAINT "UQ_61784cc8463bab250b01329cbd5" UNIQUE ("activity_id", "isibo_id"), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_eace9f270e3a8db1430d655c24" ON "tasks" ("activity_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb760e32bf46df84b5d86ebafe" ON "tasks" ("isibo_id") `);
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "comment" text, "materialsUsed" text array, "challengesFaced" text, "suggestions" text, "evidenceUrls" text array, "activityId" uuid NOT NULL, "taskId" uuid NOT NULL, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_attendance" ("report_id" uuid NOT NULL, "profile_id" uuid NOT NULL, CONSTRAINT "PK_e2761e5ef1b613e58dfdd728dec" PRIMARY KEY ("report_id", "profile_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5213862af05e74ec90b3041051" ON "report_attendance" ("report_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_60d9a31671bde7798441d13447" ON "report_attendance" ("profile_id") `);
        await queryRunner.query(`ALTER TABLE "districts" ADD CONSTRAINT "FK_9d451638507b11822dc411a2dfe" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sectors" ADD CONSTRAINT "FK_d3b63a9863908e4afc9f27884b1" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "houses" ADD CONSTRAINT "FK_2f6913f35422a16d01668831eba" FOREIGN KEY ("isibo_id") REFERENCES "isibos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "isibos" ADD CONSTRAINT "FK_fe0e391fc5adbb7ec4a59be6894" FOREIGN KEY ("leader_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "isibos" ADD CONSTRAINT "FK_30a1733a43db83cf480a7139a72" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "villages" ADD CONSTRAINT "FK_4fba61a2bfd55243549416e17c5" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cells" ADD CONSTRAINT "FK_832e55dd1776c257330682bbcff" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_297c38d77df0ee1957f777d53b5" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_d3661c745c4e5327c8f720d184b" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_b543a0f15c3a2dacde09d30ed96" FOREIGN KEY ("isibo_id") REFERENCES "isibos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_eb7721170ddc5d8fb6677e28723" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verification" ADD CONSTRAINT "FK_8300048608d8721aea27747b07a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_eace9f270e3a8db1430d655c240" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_fb760e32bf46df84b5d86ebafe3" FOREIGN KEY ("isibo_id") REFERENCES "isibos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_78f4d640906920d4985ed6a8b21" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_70482e624fc3c09f6e381f88653" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_attendance" ADD CONSTRAINT "FK_5213862af05e74ec90b30410510" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "report_attendance" ADD CONSTRAINT "FK_60d9a31671bde7798441d134476" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_attendance" DROP CONSTRAINT "FK_60d9a31671bde7798441d134476"`);
        await queryRunner.query(`ALTER TABLE "report_attendance" DROP CONSTRAINT "FK_5213862af05e74ec90b30410510"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_70482e624fc3c09f6e381f88653"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_78f4d640906920d4985ed6a8b21"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_fb760e32bf46df84b5d86ebafe3"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_eace9f270e3a8db1430d655c240"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc"`);
        await queryRunner.query(`ALTER TABLE "verification" DROP CONSTRAINT "FK_8300048608d8721aea27747b07a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_eb7721170ddc5d8fb6677e28723"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_b543a0f15c3a2dacde09d30ed96"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_d3661c745c4e5327c8f720d184b"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_297c38d77df0ee1957f777d53b5"`);
        await queryRunner.query(`ALTER TABLE "cells" DROP CONSTRAINT "FK_832e55dd1776c257330682bbcff"`);
        await queryRunner.query(`ALTER TABLE "villages" DROP CONSTRAINT "FK_4fba61a2bfd55243549416e17c5"`);
        await queryRunner.query(`ALTER TABLE "isibos" DROP CONSTRAINT "FK_30a1733a43db83cf480a7139a72"`);
        await queryRunner.query(`ALTER TABLE "isibos" DROP CONSTRAINT "FK_fe0e391fc5adbb7ec4a59be6894"`);
        await queryRunner.query(`ALTER TABLE "houses" DROP CONSTRAINT "FK_2f6913f35422a16d01668831eba"`);
        await queryRunner.query(`ALTER TABLE "sectors" DROP CONSTRAINT "FK_d3b63a9863908e4afc9f27884b1"`);
        await queryRunner.query(`ALTER TABLE "districts" DROP CONSTRAINT "FK_9d451638507b11822dc411a2dfe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60d9a31671bde7798441d13447"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5213862af05e74ec90b3041051"`);
        await queryRunner.query(`DROP TABLE "report_attendance"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb760e32bf46df84b5d86ebafe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eace9f270e3a8db1430d655c24"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13ed6c247f66cc50e29ebec1da"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "verification"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP TABLE "cells"`);
        await queryRunner.query(`DROP TABLE "villages"`);
        await queryRunner.query(`DROP TABLE "isibos"`);
        await queryRunner.query(`DROP TABLE "houses"`);
        await queryRunner.query(`DROP TABLE "sectors"`);
        await queryRunner.query(`DROP TABLE "districts"`);
        await queryRunner.query(`DROP TABLE "provinces"`);
    }

}
