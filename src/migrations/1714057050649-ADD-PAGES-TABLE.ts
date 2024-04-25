import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDPAGESTABLE1714057050649 implements MigrationInterface {
  name = 'ADDPAGESTABLE1714057050649';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`pages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(50) NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`pages\``);
  }
}
