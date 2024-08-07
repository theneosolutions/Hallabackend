export interface IResponseNotifications {
  id: number;
  user: number;
  content: string;
  status: boolean;
  resourceId: number;
  resourceType: string;
  createdAt: Date;
  updatedAt: Date;
}
