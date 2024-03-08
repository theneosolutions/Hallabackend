export interface IResponseCard{
    id: number;
    name: string;
    type?: string;
    status: string;
    notes?: string;
    file?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}