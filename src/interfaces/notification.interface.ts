import { NotificationStatus } from '../commons/enums/notification-status.enum';
import { NotificationChannel } from '../commons/enums/notification-channel.enum';

export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  htmlMessage?: string;
  metadata?: {
    traceId?: string;
    status?: NotificationStatus;
    [key: string]: any;
  };
}

export { NotificationChannel };
