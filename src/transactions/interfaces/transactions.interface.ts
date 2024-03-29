export interface ITransactions {
  id: number;
  user: number;
  amount: string;
  description: string;
  paymentId: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}
