import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDPACKAGESTABLE1711705537187 implements MigrationInterface {
    name = 'ADDPACKAGESTABLE1711705537187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`packages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`subHeading\` varchar(255) NOT NULL, \`price\` float NOT NULL, \`numberOfGuest\` int NOT NULL DEFAULT '0', \`status\` varchar(255) NOT NULL DEFAULT 'active', \`notes\` varchar(255) NULL, \`description\` varchar(5000) NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`packages\``);
    }

}
