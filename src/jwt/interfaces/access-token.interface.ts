import { ITokenBase } from './token-base.interface';

export interface IAccessPayload {
  id: number;
  type: string;
}

export interface IAccessToken extends IAccessPayload, ITokenBase {}
