import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotificationStrategy } from '../interfaces/notification-strategy.interface';
import { NotificationPayload } from '../interfaces/notification.interface';
import { JWT } from 'google-auth-library';

@Injectable()
export class PushService implements NotificationStrategy {
  private readonly projectId = process.env.FIREBASE_PROJECT_ID;
  private readonly clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  private readonly privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  private readonly jwtClient: JWT;

  constructor(
    @Inject(Logger) private readonly logger: Logger,
  ) {
    if (!this.projectId || !this.clientEmail || !this.privateKey) {
      throw new Error('Missing Firebase credentials in .env');
    }

    this.jwtClient = new JWT({
      email: this.clientEmail,
      key: this.privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
  }

  async send(payload: NotificationPayload): Promise<void> {
    const traceId = payload.metadata?.traceId ?? 'n/a';

    this.logger.debug(
      `[traceId=${traceId}] Preparing push notification for recipient ${payload.to} with title "${payload.subject}"`,
      PushService.name,
    );

    await this.jwtClient.authorize();
    const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`;

    const message = {
      message: {
        token: payload.to,
        notification: {
          title: payload.subject ?? 'New Notification',
          body: payload.message,
        },
        data: payload.metadata ?? {},
      },
    };

    this.logger.debug(
      `[traceId=${traceId}] Sending request to FCM: ${JSON.stringify(message)}`,
      PushService.name,
    );

    const response = await this.jwtClient.request({
      url,
      method: 'POST',
      data: message,
    });

    if (response.status !== 200) {
      this.logger.error(
        `[traceId=${traceId}] Failed to send push notification to ${payload.to}: ${response.status} - ${JSON.stringify(response.data)}`,
        response.data,
        PushService.name,
      );
      throw new Error(`Push notification failed: ${response.status}`);
    }

    this.logger.log(
      `[traceId=${traceId}] Push notification sent successfully to ${payload.to}`,
      PushService.name,
    );
  }
}
