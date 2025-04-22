import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1745333605224 implements MigrationInterface {
    name = 'InitialMigration1745333605224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "villages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "village_name" character varying NOT NULL, "cellId" uuid NOT NULL, CONSTRAINT "PK_3d9cf7c71c05c7ef684331317bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cells" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "cell_name" character varying NOT NULL, CONSTRAINT "PK_b9443df02c1a41bc03f264388c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "task_name" character varying NOT NULL, "description" character varying NOT NULL, "completed" boolean NOT NULL DEFAULT false, "activityId" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "location" character varying(255) NOT NULL, "maxParticipants" integer NOT NULL, "currentParticipants" integer NOT NULL DEFAULT '0', "status" character varying(50) NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "full_name" character varying, "profile_image" character varying, "is_village_leader" boolean NOT NULL DEFAULT false, "is_cell_leader" boolean NOT NULL DEFAULT false, "user_id" uuid, "cell_id" uuid, "village_id" uuid, CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"), CONSTRAINT "REL_297c38d77df0ee1957f777d53b" UNIQUE ("cell_id"), CONSTRAINT "REL_d3661c745c4e5327c8f720d184" UNIQUE ("village_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "role" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "villages" ADD CONSTRAINT "FK_371ecda302bfc5d87ff4fe87989" FOREIGN KEY ("cellId") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_30329bc11ea82af528bcafd0c87" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_297c38d77df0ee1957f777d53b5" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_d3661c745c4e5327c8f720d184b" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_d3661c745c4e5327c8f720d184b"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_297c38d77df0ee1957f777d53b5"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_30329bc11ea82af528bcafd0c87"`);
        await queryRunner.query(`ALTER TABLE "villages" DROP CONSTRAINT "FK_371ecda302bfc5d87ff4fe87989"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "cells"`);
        await queryRunner.query(`DROP TABLE "villages"`);
    }

}
