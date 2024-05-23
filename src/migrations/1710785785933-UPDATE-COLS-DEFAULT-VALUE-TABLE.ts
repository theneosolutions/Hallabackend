import { MigrationInterface, QueryRunner } from 'typeorm';

export class UPDATECOLSDEFAULTVALUETABLE1710785785933
  implements MigrationInterface
{
  name = 'UPDATECOLSDEFAULTVALUETABLE1710785785933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`code\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`haveChat\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`notes\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfGuests\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfScans\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`selectedEvent\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`sendList\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`status\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`usersId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfScans\` int NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfGuests\` int NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`usersId\` int NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`code\` varchar(255) NOT NULL DEFAULT '51e06150-a56e-44de-b3e2-83b6eaeaa786'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`notes\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`haveChat\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`selectedEvent\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`sendList\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`deletedAt\` datetime(6) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP FOREIGN KEY \`FK_2df87041f184159afec0885f3f7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP FOREIGN KEY \`FK_81ee7cc114f6a7a10cb5d847cd0\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_2df87041f184159afec0885f3f\` ON \`event_invitess_contacts\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_81ee7cc114f6a7a10cb5d847cd\` ON \`event_invitess_contacts\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD PRIMARY KEY (\`eventId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD PRIMARY KEY (\`contactsId\`, \`eventId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` CHANGE \`contactsId\` \`contactsId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contacts\` CHANGE \`code\` \`code\` varchar(255) NOT NULL DEFAULT 'b49afd2e-5956-4e8f-8c77-621fe4fbc2e1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`events\` CHANGE \`code\` \`code\` varchar(255) NOT NULL DEFAULT '5f72449a-718f-482e-9b1b-111feb40e194'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contacts\` CHANGE \`code\` \`code\` varchar(255) NOT NULL DEFAULT 'b49afd2e-5956-4e8f-8c77-621fe4fbc2e1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`credentials_updatedAt\` \`credentials_updatedAt\` int NOT NULL DEFAULT '1709821342'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`credentials_passwordUpdatedAt\` \`credentials_passwordUpdatedAt\` int NOT NULL DEFAULT '1709821342'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`sendList\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`selectedEvent\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`haveChat\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`notes\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`code\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`usersId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfGuests\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfScans\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`status\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`usersId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`sendList\` tinyint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`selectedEvent\` tinyint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfScans\` int NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfGuests\` int NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`notes\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`haveChat\` tinyint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_invitess_contacts\` ADD \`code\` varchar(255) NOT NULL DEFAULT 'f51e9855-4d3b-42fa-b940-5a89f593dc4f'`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_81ee7cc114f6a7a10cb5d847cd\` ON \`event_invitess_contacts\` (\`contactsId\`)`,
    );
  }
}
