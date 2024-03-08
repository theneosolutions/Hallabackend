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
    createdAt: string;
    updatedAt: string;
}