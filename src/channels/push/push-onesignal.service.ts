import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotificationStrategy } from '../../interfaces/notification-strategy.interface';
import { NotificationPayload } from '../../interfaces/notification.interface';
import axios from 'axios';

@Injectable()
export class PushOneSignalService implements NotificationStrategy {
  private readonly apiKey = process.env.ONESIGNAL_API_KEY;
  private readonly appId = process.env.ONESIGNAL_APP_ID;

  constructor(
    @Inject(Logger) private readonly logger: Logger,
  ) {
    if (!this.apiKey || !this.appId) {
      throw new Error('Missing ONESIGNAL_API_KEY or ONESIGNAL_APP_ID in .env');
    }
  }

  async send(payload: NotificationPayload): Promise<void> {
    const traceId = payload.metadata?.traceId ?? 'n/a';

    this.logger.debug(
      `[traceId=${traceId}] Preparing OneSignal push to ${payload.to} with subject "${payload.subject}"`,
      PushOneSignalService.name,
    );

    const body = {
      app_id: this.appId,
      include_external_user_ids: [payload.to],
      headings: { en: payload.subject ?? 'New Notification' },
      contents: { en: payload.message },
      data: payload.metadata ?? {},
    };

    try {
      const response = await axios.post('https://onesignal.com/api/v1/notifications', body, {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(
        `[traceId=${traceId}] OneSignal push sent successfully to ${payload.to} | id: ${response.data.id}`,
        PushOneSignalService.name,
      );
    } catch (error: any) {
      const message = error?.response?.data || error.message;
      this.logger.error(
        `[traceId=${traceId}] Failed to send OneSignal push to ${payload.to}: ${JSON.stringify(message)}`,
        error.stack,
        PushOneSignalService.name,
      );
      throw new Error(`OneSignal push failed: ${error.message}`);
    }
  }
}
