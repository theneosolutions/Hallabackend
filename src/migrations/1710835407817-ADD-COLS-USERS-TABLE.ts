import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDCOLSUSERSTABLE1710835407817 implements MigrationInterface {
  name = 'ADDCOLSUSERSTABLE1710835407817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`address\` varchar(255) NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`latitude\` decimal(10,6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`longitude\` decimal(10,6) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`longitude\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`latitude\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address\``);
  }
}
