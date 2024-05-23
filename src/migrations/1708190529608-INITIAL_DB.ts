import { MigrationInterface, QueryRunner } from 'typeorm';

export class INITIALDB1708190529608 implements MigrationInterface {
  name = 'INITIALDB1708190529608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`loginType\` varchar(255) NOT NULL, \`profilePhoto\` varchar(255) NOT NULL, \`roles\` enum ('admin', 'moderator', 'user') NOT NULL DEFAULT 'user', \`status\` enum ('active', 'disabled') NOT NULL DEFAULT 'active', \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`confirmed\` tinyint NOT NULL, \`callingCode\` varchar(255) NULL, \`phoneNumber\` varchar(255) NULL, \`otp\` int NOT NULL, \`isPhoneVerified\` tinyint NOT NULL, \`isBanned\` tinyint NOT NULL, \`referredBy\` varchar(255) NULL, \`referenceCode\` varchar(255) NULL, \`deviceToken\` text NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, \`credentials_version\` int NOT NULL DEFAULT '0', \`credentials_lastPassword\` varchar(255) NOT NULL DEFAULT '', \`credentials_passwordUpdatedAt\` int NOT NULL DEFAULT '1708190533', \`credentials_updatedAt\` int NOT NULL DEFAULT '1708190533', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`blacklisted_token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tokenId\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` ADD CONSTRAINT \`FK_b480c0aeecbe6980a8e8ce2c6aa\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` DROP FOREIGN KEY \`FK_b480c0aeecbe6980a8e8ce2c6aa\``,
    );
    await queryRunner.query(`DROP TABLE \`blacklisted_token\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
