import { MigrationInterface, QueryRunner } from 'typeorm';

export class MAKEEMAILCOLNULLABLE1708261431084 implements MigrationInterface {
  name = 'MAKEEMAILCOLNULLABLE1708261431084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`callingCode\` \`callingCode\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`referredBy\` \`referredBy\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`referenceCode\` \`referenceCode\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`deviceToken\` \`deviceToken\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`updatedAt\` \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`credentials_passwordUpdatedAt\` \`credentials_passwordUpdatedAt\` int NOT NULL DEFAULT '1708261436'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`credentials_updatedAt\` \`credentials_updatedAt\` int NOT NULL DEFAULT '1708261436'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` DROP FOREIGN KEY \`FK_b480c0aeecbe6980a8e8ce2c6aa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` CHANGE \`userId\` \`userId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` ADD CONSTRAINT \`FK_b480c0aeecbe6980a8e8ce2c6aa\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` DROP FOREIGN KEY \`FK_b480c0aeecbe6980a8e8ce2c6aa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blacklisted_token\` ADD CONSTRAINT \`FK_b480c0aeecbe6980a8e8ce2c6aa\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`credentials_updatedAt\` \`credentials_updatedAt\` int NOT NULL DEFAULT '1708190533'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`credentials_passwordUpdatedAt\` \`credentials_passwordUpdatedAt\` int NOT NULL DEFAULT '1708190533'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`updatedAt\` \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`deviceToken\` \`deviceToken\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`referenceCode\` \`referenceCode\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`referredBy\` \`referredBy\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`callingCode\` \`callingCode\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`,
    );
  }
}
