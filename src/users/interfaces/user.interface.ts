

import { ICredentials } from './credentials.interface';

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  status?: string;
  callingCode?: string;
  phoneNumber?: string;
  otp: number;
  isPhoneVerified?: boolean;
  password?: string;
  loginType?: string;
  profilePhoto?: string;
  referredBy?: string;
  referenceCode?: string;
  roles?: string;
  confirmed: boolean;
  isBanned: boolean;
  deviceToken?: string;
  credentials: ICredentials;
  createdAt: Date;
  updatedAt: Date;
}
