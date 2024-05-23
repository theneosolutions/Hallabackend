export interface IResponseTransactions {
  id: number;
  user: number;
  package: number;
  amount: string;
  description: string;
  paymentId: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}
