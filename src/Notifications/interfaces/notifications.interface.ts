
export interface INotifications {
  id: number;
  user: number;
  content: string;
  status: boolean;
  resourceId: number;
  resourceType: string;
  parentType?: string,
  parent?: number,
  createdAt: Date;
  updatedAt: Date;
}
