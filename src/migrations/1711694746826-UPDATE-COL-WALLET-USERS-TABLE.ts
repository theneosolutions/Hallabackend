import { MigrationInterface, QueryRunner } from "typeorm";

export class UPDATECOLWALLETUSERSTABLE1711694746826 implements MigrationInterface {
    name = 'UPDATECOLWALLETUSERSTABLE1711694746826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`wallet\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`wallet\` decimal(10,2) NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`wallet\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`wallet\` int NULL DEFAULT '0'`);
    }

}
