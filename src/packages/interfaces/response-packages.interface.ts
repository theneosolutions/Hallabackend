export interface IResponsePackages {
  id: number;
  name: string;
  subHeading?: string;
  price: number;
  numberOfGuest?: number;
  status: string;
  notes?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
