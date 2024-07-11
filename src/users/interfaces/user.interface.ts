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
  address?: string;
  latitude?: number;
  longitude?: number;
  credentials: ICredentials;
  wallet?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  revenueGeneratedByUser: number;
  userEventCount: number;
  availableInvitationCount: number;
}
