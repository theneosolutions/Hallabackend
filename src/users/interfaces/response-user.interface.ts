export interface IResponseUser {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    status?: string;
    loginType?: string;
    profilePhoto?: string;
    referenceCode?: string;
    roles?: string;
    confirmed: boolean;
    isBanned: boolean;
    callingCode?: string;
    phoneNumber?: string;
    isPhoneVerified?: boolean;
    address?: string;
    latitude?: number;
    longitude?: number;
    wallet?: number;
    createdAt: string;
    updatedAt: string;
}