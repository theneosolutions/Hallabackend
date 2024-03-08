export interface IResponseEvent {
    id: number;
    user: number;
    contacts?: any;
    name: string;
    image?: string;
    eventDate: string;
    status: string;
    notes?: string;
    showQRCode?: boolean;
    latitude?: number;
    longitude?: number;
    code?: string;
    createdAt: string;
    updatedAt: string;
}