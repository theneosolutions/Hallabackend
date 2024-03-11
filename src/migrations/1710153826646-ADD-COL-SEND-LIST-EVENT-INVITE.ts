import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDCOLSENDLISTEVENTINVITE1710153826646 implements MigrationInterface {
    name = 'ADDCOLSENDLISTEVENTINVITE1710153826646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD \`sendList\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`sendList\``);
    }

}
