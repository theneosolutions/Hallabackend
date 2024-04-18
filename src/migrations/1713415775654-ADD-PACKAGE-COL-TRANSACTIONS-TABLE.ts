import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDPACKAGECOLTRANSACTIONSTABLE1713415775654 implements MigrationInterface {
    name = 'ADDPACKAGECOLTRANSACTIONSTABLE1713415775654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`packageId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_73816dad61bd46ada2e07a2b33c\` FOREIGN KEY (\`packageId\`) REFERENCES \`packages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_73816dad61bd46ada2e07a2b33c\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`packageId\``);
    }

}
