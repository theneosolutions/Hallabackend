export interface ITransactions {
  id: number;
  user: number;
  package: number;
  amount: string;
  description: string;
  paymentId: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}
