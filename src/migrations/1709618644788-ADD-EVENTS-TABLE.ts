import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDEVENTSTABLE1709618644788 implements MigrationInterface {
    name = 'ADDEVENTSTABLE1709618644788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`events\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL DEFAULT 'active', \`image\` varchar(255) NULL DEFAULT '', \`status\` varchar(255) NOT NULL DEFAULT 'draft', \`notes\` varchar(255) NULL DEFAULT '', \`eventDate\` varchar(255) NULL DEFAULT '', \`showQRCode\` tinyint NOT NULL, \`latitude\` decimal(10,6) NULL, \`longitude\` decimal(10,6) NULL, \`code\` varchar(255) NOT NULL DEFAULT '0cdb15a7-d57d-4902-bec2-b5c7fbcf28dd', \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`event_invitess_contacts\` (\`status\` varchar(255) NOT NULL DEFAULT 'invited', \`numberOfScans\` decimal(6,2) NULL DEFAULT '0.00', \`numberOfGuests\` decimal(6,2) NULL DEFAULT '0.00', \`usersId\` int NOT NULL, \`eventId\` int NOT NULL, \`code\` varchar(255) NOT NULL DEFAULT '2a18ed1b-b44f-47c7-8035-e48900db080e', \`notes\`varchar(255) NULL DEFAULT 'email', \`haveChat\` tinyint NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`usersId\`, \`eventId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`credentials_passwordUpdatedAt\` \`credentials_passwordUpdatedAt\` int NOT NULL DEFAULT '1709618648'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`credentials_updatedAt\` \`credentials_updatedAt\` int NOT NULL DEFAULT '1709618648'`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_9929fa8516afa13f87b41abb263\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD CONSTRAINT \`FK_eeadf26eabd3286bb037f5a39c2\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD CONSTRAINT \`FK_2df87041f184159afec0885f3f7\` FOREIGN KEY (\`eventId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP FOREIGN KEY \`FK_2df87041f184159afec0885f3f7\``);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP FOREIGN KEY \`FK_eeadf26eabd3286bb037f5a39c2\``);

        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_9929fa8516afa13f87b41abb263\``);

        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`credentials_updatedAt\` \`credentials_updatedAt\` int NOT NULL DEFAULT '1708261436'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`credentials_passwordUpdatedAt\` \`credentials_passwordUpdatedAt\` int NOT NULL DEFAULT '1708261436'`);
        await queryRunner.query(`DROP TABLE \`event_invitess_contacts\``);

        await queryRunner.query(`DROP TABLE \`events\``);
    }

}
