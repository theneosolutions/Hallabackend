import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDCOLEVENTSELECTEDEVENTINVITE1710139949803 implements MigrationInterface {
    name = 'ADDCOLEVENTSELECTEDEVENTINVITE1710139949803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfScans\``);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfGuests\``);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfScans\` int NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfGuests\` int NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD \`selectedEvent\` tinyint NOT NULL DEFAULT 0`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`selectedEvent\``);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfGuests\``);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` DROP COLUMN \`numberOfScans\``);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfGuests\` decimal(6,2) NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`event_invitess_contacts\` ADD \`numberOfScans\` decimal(6,2) NULL DEFAULT '0.00'`);
       
    }

}
