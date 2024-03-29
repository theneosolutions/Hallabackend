import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDCOLWALLETUSERSTABLE1711693383073 implements MigrationInterface {
    name = 'ADDCOLWALLETUSERSTABLE1711693383073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`wallet\` int NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`wallet\``);
    }

}
