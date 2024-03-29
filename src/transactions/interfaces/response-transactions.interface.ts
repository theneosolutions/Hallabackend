export interface IResponseTransactions {
    id: number;
    user: number;
    amount: string;
    description: string;
    paymentId: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
}