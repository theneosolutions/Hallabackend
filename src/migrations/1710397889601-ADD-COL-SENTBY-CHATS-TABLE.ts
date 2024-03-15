import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDCOLSENTBYCHATSTABLE1710397889601 implements MigrationInterface {
    name = 'ADDCOLSENTBYCHATSTABLE1710397889601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events_chats\` ADD \`sentBy\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events_chats\` DROP COLUMN \`sentBy\``);
    }

}
