import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDCARDTABLE1709702548931 implements MigrationInterface {
  name = 'ADDCARDTABLE1709702548931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`card\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL DEFAULT 'active', \`type\` varchar(255) NULL, \`status\` varchar(255) NOT NULL DEFAULT 'draft', \`notes\` varchar(4000) NULL, \`file\` text NULL, \`image\` varchar(1024) NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`events_card_card\` (\`eventsId\` int NOT NULL, \`cardId\` int NOT NULL, INDEX \`IDX_48fe0474c2ca15bcab7f420d88\` (\`eventsId\`), INDEX \`IDX_990dd9aad045918d9164ac5ec6\` (\`cardId\`), PRIMARY KEY (\`eventsId\`, \`cardId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`events\` ADD \`nearby\` varchar(255) NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`events\` ADD \`address\` varchar(255) NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`events_card_card\` ADD CONSTRAINT \`FK_48fe0474c2ca15bcab7f420d885\` FOREIGN KEY (\`eventsId\`) REFERENCES \`events\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`events_card_card\` ADD CONSTRAINT \`FK_990dd9aad045918d9164ac5ec65\` FOREIGN KEY (\`cardId\`) REFERENCES \`card\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`events_card_card\` DROP FOREIGN KEY \`FK_990dd9aad045918d9164ac5ec65\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`events_card_card\` DROP FOREIGN KEY \`FK_48fe0474c2ca15bcab7f420d885\``,
    );
    await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`address\``);
    await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`nearby\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_990dd9aad045918d9164ac5ec6\` ON \`events_card_card\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_48fe0474c2ca15bcab7f420d88\` ON \`events_card_card\``,
    );
    await queryRunner.query(`DROP TABLE \`events_card_card\``);
    await queryRunner.query(`DROP TABLE \`card\``);
  }
}
