import { NotificationPayload } from './notification.interface';

export interface NotificationStrategy {
  send(payload: NotificationPayload): Promise<void>;
}
