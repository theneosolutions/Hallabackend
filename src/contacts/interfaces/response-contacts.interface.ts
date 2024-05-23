export interface IResponseContacts {
  id: number;
  user: number;
  name: string;
  suffix: string;
  email: string;
  status?: string;
  callingCode?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}
