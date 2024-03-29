import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDTRANSACTIONSTABLE1711639454566 implements MigrationInterface {
    name = 'ADDTRANSACTIONSTABLE1711639454566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`transactions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`status\` enum ('Initiated', 'Paid', 'Failed') NOT NULL DEFAULT 'Initiated', \`paymentId\` varchar(255) NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_6bb58f2b6e30cb51a6504599f41\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_6bb58f2b6e30cb51a6504599f41\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
    }

}
