import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDEVENTCHATSTABLE1710143424236 implements MigrationInterface {
    name = 'ADDEVENTCHATSTABLE1710143424236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`events_chats\` (\`id\` int NOT NULL AUTO_INCREMENT, \`action\` varchar(255) NOT NULL, \`actionData\` varchar(1024) NULL, \`actionType\` varchar(50) NULL, \`mediaURL\` varchar(255) NULL DEFAULT '', \`mediaCaption\` varchar(255) NULL DEFAULT '', \`isRead\` tinyint NOT NULL DEFAULT 0, \`additionalInfo\` text NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`actionUserId\` int NULL, \`contactId\` int NULL, \`eventId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`events_chats\` ADD CONSTRAINT \`FK_be851a2a7e2ef05eac8c03fa6b2\` FOREIGN KEY (\`actionUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`events_chats\` ADD CONSTRAINT \`FK_0bccecac1254c50c32e6eaf44c6\` FOREIGN KEY (\`contactId\`) REFERENCES \`contacts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`events_chats\` ADD CONSTRAINT \`FK_0b5915dbf9df1e38b95b6e94454\` FOREIGN KEY (\`eventId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events_chats\` DROP FOREIGN KEY \`FK_0b5915dbf9df1e38b95b6e94454\``);
        await queryRunner.query(`ALTER TABLE \`events_chats\` DROP FOREIGN KEY \`FK_0bccecac1254c50c32e6eaf44c6\``);
        await queryRunner.query(`ALTER TABLE \`events_chats\` DROP FOREIGN KEY \`FK_be851a2a7e2ef05eac8c03fa6b2\``);
        await queryRunner.query(`DROP TABLE \`events_chats\``);
    }

}
