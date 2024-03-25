export interface IAuthResponseUser {
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
    otp?:number;
    confirmed: boolean;
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
}