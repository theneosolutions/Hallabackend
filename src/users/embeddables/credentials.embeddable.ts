

import { Column } from 'typeorm';
import dayjs from 'dayjs';
import { ICredentials } from '../interfaces/credentials.interface';

export class CredentialsEmbeddable implements ICredentials {
  @Column({ name: 'credentials_version', type: 'int', default: 0, nullable: false })
  public version = 0;

  @Column({ name: 'credentials_lastPassword', type: 'varchar', default: '', nullable: false })
  public lastPassword = '';

  @Column({ name: 'credentials_passwordUpdatedAt', type: 'int', default: dayjs().unix(), nullable: false })
  public passwordUpdatedAt: number = dayjs().unix();

  @Column({ name: 'credentials_updatedAt', default: dayjs().unix(), nullable: false })
  public updatedAt: number;

  public updatePassword(password: string): void {
    this.version++;
    this.lastPassword = password || "";
    this.passwordUpdatedAt = dayjs().unix();
    this.updatedAt = dayjs().unix();
  }

  public updateVersion(): void {
    this.version++;
    this.updatedAt = dayjs().unix();
  }
}
