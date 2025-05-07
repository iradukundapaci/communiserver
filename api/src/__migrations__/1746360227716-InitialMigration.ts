import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1746360227716 implements MigrationInterface {
    name = 'InitialMigration1746360227716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "houses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "house_code" character varying NOT NULL, "street" character varying, "representative_id" uuid, "isibo_id" uuid NOT NULL, CONSTRAINT "PK_ee6cacb502a4b8590005eb3dc8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "isibos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "leader_id" uuid, "village_id" uuid NOT NULL, CONSTRAINT "PK_5e2921bfe9f2820ea8b1fccf8a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "villages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "village_name" character varying NOT NULL, "cell_id" uuid NOT NULL, CONSTRAINT "PK_3d9cf7c71c05c7ef684331317bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cells" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "cell_name" character varying NOT NULL, CONSTRAINT "UQ_b8dbdb2ce7b89a5651b0798ed5a" UNIQUE ("cell_name"), CONSTRAINT "PK_b9443df02c1a41bc03f264388c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "description" text NOT NULL, "completed" boolean NOT NULL DEFAULT false, "activity_id" uuid, "assigned_to_id" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "description" text NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "location" character varying(255), "status" character varying(50) NOT NULL, "organizer_id" uuid, "cell_id" uuid, "village_id" uuid, CONSTRAINT "REL_ff7a3309d4af67667187ff672a" UNIQUE ("organizer_id"), CONSTRAINT "REL_7a5b867cb5a891defd640ae61c" UNIQUE ("cell_id"), CONSTRAINT "REL_484c13bbb2690a2cdecb38267d" UNIQUE ("village_id"), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_13ed6c247f66cc50e29ebec1da" ON "activities" ("title") `);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "names" character varying NOT NULL, "is_village_leader" boolean NOT NULL DEFAULT false, "is_cell_leader" boolean NOT NULL DEFAULT false, "is_isibo_leader" boolean NOT NULL DEFAULT false, "cell_id" uuid, "village_id" uuid, "house_id" uuid, CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "phone" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, "refreshToken" character varying, "verifiedAt" TIMESTAMP WITH TIME ZONE, "activated" boolean DEFAULT true, "profileId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_b1bda35cdb9a2c1b777f5541d8" UNIQUE ("profileId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "verification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "verificationCode" character varying NOT NULL, "expiresAt" TIMESTAMP, "userId" uuid, CONSTRAINT "UQ_61ecc78f1930df8d99297474fb8" UNIQUE ("verificationCode"), CONSTRAINT "REL_8300048608d8721aea27747b07" UNIQUE ("userId"), CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "value" character varying NOT NULL DEFAULT false, CONSTRAINT "UQ_27923d152bbf82683ab795d5476" UNIQUE ("name"), CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_participants" ("activity_id" uuid NOT NULL, "profile_id" uuid NOT NULL, CONSTRAINT "PK_35b9890fa1e4012b6a00929297e" PRIMARY KEY ("activity_id", "profile_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9cb6d690439d69efb428151cf0" ON "activity_participants" ("activity_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_93654dd7a1b2a29f0d769e5b85" ON "activity_participants" ("profile_id") `);
        await queryRunner.query(`ALTER TABLE "houses" ADD CONSTRAINT "FK_1ab89707fa8f556b9ee9ff19c93" FOREIGN KEY ("representative_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "houses" ADD CONSTRAINT "FK_2f6913f35422a16d01668831eba" FOREIGN KEY ("isibo_id") REFERENCES "isibos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "isibos" ADD CONSTRAINT "FK_fe0e391fc5adbb7ec4a59be6894" FOREIGN KEY ("leader_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "isibos" ADD CONSTRAINT "FK_30a1733a43db83cf480a7139a72" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "villages" ADD CONSTRAINT "FK_4fba61a2bfd55243549416e17c5" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_eace9f270e3a8db1430d655c240" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9430f12c5a1604833f64595a57f" FOREIGN KEY ("assigned_to_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_ff7a3309d4af67667187ff672a2" FOREIGN KEY ("organizer_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_7a5b867cb5a891defd640ae61cd" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_297c38d77df0ee1957f777d53b5" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_d3661c745c4e5327c8f720d184b" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_eb7721170ddc5d8fb6677e28723" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verification" ADD CONSTRAINT "FK_8300048608d8721aea27747b07a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_9cb6d690439d69efb428151cf0a" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_93654dd7a1b2a29f0d769e5b85b" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_93654dd7a1b2a29f0d769e5b85b"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_9cb6d690439d69efb428151cf0a"`);
        await queryRunner.query(`ALTER TABLE "verification" DROP CONSTRAINT "FK_8300048608d8721aea27747b07a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_eb7721170ddc5d8fb6677e28723"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_d3661c745c4e5327c8f720d184b"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_297c38d77df0ee1957f777d53b5"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_484c13bbb2690a2cdecb38267dc"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_7a5b867cb5a891defd640ae61cd"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_ff7a3309d4af67667187ff672a2"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9430f12c5a1604833f64595a57f"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_eace9f270e3a8db1430d655c240"`);
        await queryRunner.query(`ALTER TABLE "villages" DROP CONSTRAINT "FK_4fba61a2bfd55243549416e17c5"`);
        await queryRunner.query(`ALTER TABLE "isibos" DROP CONSTRAINT "FK_30a1733a43db83cf480a7139a72"`);
        await queryRunner.query(`ALTER TABLE "isibos" DROP CONSTRAINT "FK_fe0e391fc5adbb7ec4a59be6894"`);
        await queryRunner.query(`ALTER TABLE "houses" DROP CONSTRAINT "FK_2f6913f35422a16d01668831eba"`);
        await queryRunner.query(`ALTER TABLE "houses" DROP CONSTRAINT "FK_1ab89707fa8f556b9ee9ff19c93"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93654dd7a1b2a29f0d769e5b85"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cb6d690439d69efb428151cf0"`);
        await queryRunner.query(`DROP TABLE "activity_participants"`);
        await queryRunner.query(`DROP TABLE "setting"`);
        await queryRunner.query(`DROP TABLE "verification"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13ed6c247f66cc50e29ebec1da"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "cells"`);
        await queryRunner.query(`DROP TABLE "villages"`);
        await queryRunner.query(`DROP TABLE "isibos"`);
        await queryRunner.query(`DROP TABLE "houses"`);
    }

}
