import { NotificationStatus } from './notification-status.enum';
import { NotificationChannel } from './notification-channel.enum';

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
