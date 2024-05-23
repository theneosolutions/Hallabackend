export interface IContacts {
  id: number;
  user: number;
  name: string;
  suffix: string;
  email: string;
  status?: string;
  callingCode?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
