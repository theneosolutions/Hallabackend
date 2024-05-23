import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDNOTIFICATIONSTABLE1710135034888 implements MigrationInterface {
  name = 'ADDNOTIFICATIONSTABLE1710135034888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(255) NOT NULL DEFAULT 'active', \`status\` tinyint NOT NULL DEFAULT 0, \`resourceId\` bigint NULL DEFAULT 0, \`parent\` bigint NULL, \`resourceType\` varchar(255) NULL, \`parentType\` varchar(255) NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\``,
    );
    await queryRunner.query(`DROP TABLE \`notifications\``);
  }
}
