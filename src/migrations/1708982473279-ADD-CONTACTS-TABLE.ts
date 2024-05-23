import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDCONTACTSTABLE1708982473279 implements MigrationInterface {
  name = 'ADDCONTACTSTABLE1708982473279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`contacts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`suffix\` varchar(255) NOT NULL, \`status\` enum ('active', 'disabled') NOT NULL DEFAULT 'active', \`email\` varchar(255) NULL, \`callingCode\` varchar(255) NULL, \`phoneNumber\` varchar(255) NULL, \`code\` varchar(255) NOT NULL DEFAULT 'a3cc7e92-bc22-4fba-b088-7237efcc6889', \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contacts\` ADD CONSTRAINT \`FK_30ef77942fc8c05fcb829dcc61d\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`contacts\` CHANGE \`code\` \`code\` varchar(255) NOT NULL DEFAULT 'a3cc7e92-bc22-4fba-b088-7237efcc6889'`,
    );
    await queryRunner.query(`DROP TABLE \`contacts\``);
  }
}
